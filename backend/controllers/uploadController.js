import fs from "fs";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Room from "../models/Room.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const validators = {
  courses: ["code", "title", "program", "semester", "credits"],
  faculty: ["department", "max_weekly_hours"],
  students: ["program", "year"],
  rooms: ["name", "capacity", "building"],
};

export const uploadCSV = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type || !validators[type]) {
      return res.status(400).json({ message: "Invalid upload type" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        const missing = validators[type].filter((f) => !row[f]);
        if (missing.length) {
          errors.push({ row, missing });
        } else {
          results.push(row);
        }
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path);

        if (results.length === 0)
          return res
            .status(400)
            .json({ message: "No valid records", errors });

        let inserted = [];

        try {
          switch (type) {
            case "courses":
              inserted = await Course.insertMany(results, {
                ordered: false, // continue on duplicates
              });
              break;
            case "faculty":
              inserted = await Faculty.insertMany(results, {
                ordered: false,
              });
              break;
            case "students":
              inserted = await Student.insertMany(results, {
                ordered: false,
              });
              break;
            case "rooms":
              inserted = await Room.insertMany(results, {
                ordered: false,
              });
              break;
          }
        } catch (err) {
          // Handle duplicate key errors gracefully
          if (err.writeErrors) {
            err.writeErrors.forEach((we) => {
              errors.push({
                message: we.err.errmsg,
                code: we.err.code,
                record: we.err.op,
              });
            });
          } else {
            console.error("Upload insert error:", err);
          }
        }

        res.json({
          message: `${inserted.length} ${type} imported successfully (duplicates skipped)`,
          errorsCount: errors.length,
          errors,
        });
      });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const sendFacultyAlerts = async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get the day of the week from the selected date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get the latest timetable
    const timetable = await Timetable.findOne().sort({ created_at: -1 });
    if (!timetable) {
      return res.status(404).json({ message: "No timetable found" });
    }

    // Filter classes for the selected day
    const scheduledClasses = timetable.data.filter(slot => 
      slot.day === dayOfWeek && slot.faculty_id
    );

    if (scheduledClasses.length === 0) {
      return res.status(200).json({ message: "No classes scheduled for this date" });
    }

    // Get unique faculty IDs
    const facultyIds = [...new Set(scheduledClasses.map(slot => slot.faculty_id))];
    
    // Get faculty details with user information
    const facultyList = await Faculty.find({ _id: { $in: facultyIds } }).populate('user_id');
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let emailsSent = 0;
    const emailPromises = [];

    for (const faculty of facultyList) {
      // Get classes for this faculty
      const facultyClasses = scheduledClasses.filter(slot => 
        slot.faculty_id.toString() === faculty._id.toString()
      );

      // Skip if no user email available
      if (!faculty.user_id?.email) {
        console.log(`No email found for faculty ${faculty._id}`);
        continue;
      }

      // Create email content
      const classDetails = facultyClasses.map(cls => 
        `• ${cls.time_slot} - ${cls.course_name} (Room: ${cls.room_id}, Batch: ${cls.batch_id})`
      ).join('\n');

      const emailContent = `
Dear Faculty Member,

This is a reminder about your scheduled classes for ${new Date(date).toLocaleDateString()}:

${classDetails}

Please confirm:
1. Will you be taking these scheduled classes?
2. If you cannot attend, please update your availability on the website immediately
3. Contact the admin if there are any scheduling conflicts

Please respond within 24 hours of receiving this email.

To update your availability, please log in to: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

Thank you,
Timetable Management System
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: faculty.user_id.email,
        subject: `Class Schedule Confirmation - ${new Date(date).toLocaleDateString()}`,
        text: emailContent,
      };

      emailPromises.push(
        transporter.sendMail(mailOptions)
          .then(() => {
            emailsSent++;
            console.log(`Email sent to ${faculty.user_id.email}`);
          })
          .catch(err => {
            console.error(`Failed to send email to ${faculty.user_id.email}:`, err);
          })
      );
    }

    // Wait for all emails to be sent
    await Promise.allSettled(emailPromises);

    res.json({
      message: `Faculty alert emails sent successfully to ${emailsSent} faculty members for ${scheduledClasses.length} scheduled classes`,
      emailsSent,
      totalClasses: scheduledClasses.length,
      date: new Date(date).toLocaleDateString()
    });

  } catch (error) {
    console.error('Failed to send faculty alerts:', error);
    res.status(500).json({ message: 'Failed to send faculty alerts', error: error.message });
  }
};

export const sendFollowUpEmails = async (req, res) => {
  try {
    const { date, facultyIds } = req.body;
    
    if (!date || !facultyIds || !Array.isArray(facultyIds)) {
      return res.status(400).json({ message: "Date and faculty IDs are required" });
    }

    const facultyList = await Faculty.find({ _id: { $in: facultyIds } }).populate('user_id');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let emailsSent = 0;
    const emailPromises = [];

    for (const faculty of facultyList) {
      if (!faculty.user_id?.email) continue;

      const emailContent = `
Dear ${faculty.user_id.name},

This is a follow-up reminder regarding your scheduled classes for ${new Date(date).toLocaleDateString()}.

We have not received your confirmation yet. Please:
1. Confirm if you will be taking your scheduled classes
2. Update your availability on the website if you cannot attend
3. Contact the admin immediately if there are any issues

Please respond as soon as possible to avoid scheduling conflicts.

Website: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

Thank you,
Timetable Management System
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: faculty.user_id.email,
        subject: `URGENT: Class Schedule Follow-up - ${new Date(date).toLocaleDateString()}`,
        text: emailContent,
      };

      emailPromises.push(
        transporter.sendMail(mailOptions)
          .then(() => emailsSent++)
          .catch(err => console.error(`Failed to send follow-up to ${faculty.user_id.email}:`, err))
      );
    }

    await Promise.allSettled(emailPromises);

    res.json({
      message: `Follow-up emails sent to ${emailsSent} faculty members`,
      emailsSent
    });

  } catch (error) {
    console.error('Failed to send follow-up emails:', error);
    res.status(500).json({ message: 'Failed to send follow-up emails', error: error.message });
  }
};

export const sendUnavailabilityAlert = async (req, res) => {
  try {
    const { facultyId } = req.body;
    
    const faculty = await Faculty.findById(facultyId).populate('user_id');
    if (!faculty || !faculty.user_id) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Create notification for admin
    await Notification.create({
      message: `🚨 ${faculty.user_id.name} marked unavailable for some time slots. Check timetable for affected classes.`,
      type: 'faculty_unavailable',
      facultyId: faculty._id,
    });

    console.log('Notification created for faculty unavailability:', faculty.user_id.name);
    res.json({ message: 'Admin notified of unavailability' });

  } catch (error) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ message: 'Failed to notify admin', error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('facultyId', 'user_id')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};
