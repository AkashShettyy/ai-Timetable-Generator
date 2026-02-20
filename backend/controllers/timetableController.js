// controllers/timetableController.js

import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Room from "../models/Room.js";
import Timetable from "../models/Timetable.js";

/* =========================
   Constants (kept from your code)
   ========================= */

// 9-4 time slots (6 hours, with lunch break)
const timeSlots = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
];

// Lunch break slot - not available for classes
const LUNCH_BREAK = "12:00-13:00";

// Keep full list for UI compatibility
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Working days used by the generators (you can add "Sat" if needed)
const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/* =========================
   Helpers
   ========================= */

const toKey = (...parts) => parts.join("||");

// Unbiased Fisher–Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ALL_SLOTS = WORKING_DAYS.flatMap((day) =>
  timeSlots.map((t) => ({ day, time: t }))
);

const facultyNameOf = (f) => f?.name || f?.department || "faculty";

const isLabLike = (title = "") =>
  /lab|practical|programming|database|web development|software engineering/i.test(
    title
  );

/* =========================
   1) AI-powered timetable generation for student courses
   (your function — corrected for clashes & consistency)
   ========================= */

export const generateStudentTimetable = async (studentCourses) => {
  try {
    console.log("🎯 Generating timetable for courses:", studentCourses);

    const courses = await Course.find({ _id: { $in: studentCourses } });
    const faculty = await Faculty.find();
    const rooms = await Room.find();

    console.log(
      "📊 Data available - Courses:",
      courses.length,
      "Faculty:",
      faculty.length,
      "Rooms:",
      rooms.length,
      "Min classes required:",
      4
    );
    console.log(
      "👨‍🏫 Faculty names:",
      faculty.map((f) => f.name || f.department).join(", ")
    );

    if (!courses.length || !faculty.length || !rooms.length) {
      throw new Error(
        `Missing data - Courses: ${courses.length}, Faculty: ${faculty.length}, Rooms: ${rooms.length}`
      );
    }

    const timetable = [];
    // conflict maps (faculty/room per slot)
    const facultyAtSlot = new Set();
    const roomAtSlot = new Set();

    for (const course of courses) {
      // Prefer faculty with matching expertise
      const availableFaculty = faculty.filter((f) =>
        (f.expertise || []).some(
          (exp) =>
            course.title.toLowerCase().includes(exp.toLowerCase()) ||
            exp.toLowerCase().includes(course.title.toLowerCase())
        )
      );
      const pool = availableFaculty.length ? availableFaculty : faculty;

      let assigned = false;

      for (const day of WORKING_DAYS) {
        if (assigned) break;

        for (const f of pool) {
          const avail =
            (f.availability && f.availability[day.toLowerCase()]) || timeSlots;

          for (const timeSlot of avail) {
            if (timeSlot === LUNCH_BREAK) continue;

            const fName = facultyNameOf(f);
            const fKey = toKey(fName, day, timeSlot);
            if (facultyAtSlot.has(fKey)) continue;

            // pick a free room
            let chosenRoom = null;
            for (const r of rooms) {
              const rKey = toKey(r.name, day, timeSlot);
              if (!roomAtSlot.has(rKey)) {
                chosenRoom = r;
                break;
              }
            }
            if (!chosenRoom) continue;

            timetable.push({
              course: course.title,
              course_code: course.code,
              faculty: fName,
              faculty_id: f._id,
              room: chosenRoom.name,
              room_id: chosenRoom._id,
              day,
              time: timeSlot,
              batch_id: `Sem${course.semester || Math.floor(Math.random() * 8) + 1}`,
              semester: course.semester || Math.floor(Math.random() * 8) + 1,
            });

            facultyAtSlot.add(fKey);
            roomAtSlot.add(toKey(chosenRoom.name, day, timeSlot));
            assigned = true;
            break;
          }
          if (assigned) break;
        }
      }

      // Fallback if no slot found
      if (!assigned) {
        const fallbackDay =
          WORKING_DAYS[Math.floor(Math.random() * WORKING_DAYS.length)];
        const fallbackTime =
          timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const f = faculty[Math.floor(Math.random() * faculty.length)];
        const r = rooms[Math.floor(Math.random() * rooms.length)];

        timetable.push({
          course: course.title,
          course_code: course.code,
          faculty: facultyNameOf(f),
          faculty_id: f._id,
          room: r.name,
          room_id: r._id,
          day: fallbackDay,
          time: fallbackTime,
          batch_id: `Sem${course.semester || Math.floor(Math.random() * 8) + 1}`,
          semester: course.semester || Math.floor(Math.random() * 8) + 1,
        });
      }
    }

    return timetable;
  } catch (error) {
    console.error("Timetable generation error:", error);
    throw error;
  }
};

/* =========================
   2) Global timetable generation (naive) — corrected
   ========================= */

export const generateNaiveTimetable = async (req, res) => {
  try {
    console.log("🚀 Starting global timetable generation...");

    const courses = await Course.find();
    const faculty = await Faculty.find();
    const rooms = await Room.find();

    console.log(
      "📊 Available data - Courses:",
      courses.length,
      "Faculty:",
      faculty.length,
      "Rooms:",
      rooms.length
    );

    if (!courses.length) {
      return res
        .status(400)
        .json({ message: "No courses found. Please add courses first." });
    }
    if (!faculty.length) {
      return res
        .status(400)
        .json({ message: "No faculty found. Please add faculty first." });
    }
    if (!rooms.length) {
      return res
        .status(400)
        .json({ message: "No rooms found. Please add rooms first." });
    }

    // Conflict prevention
    const facultyAtSlot = new Set(); // key: facultyName||day||time
    const roomAtSlot = new Set(); // key: roomName||day||time

    // Workload caps (demo friendly)
    const maxPerFacultyTotal = 6;
    const workload = new Map();
    faculty.forEach((f) => workload.set(f._id.toString(), 0));

    // Decide how many sessions you want to generate
    const targetClasses = Math.min(
      courses.length * 2,
      WORKING_DAYS.length * timeSlots.length
    );

    const slots = shuffle(ALL_SLOTS);
    const shuffledCourses = shuffle(courses);
    const shuffledFaculty = shuffle(faculty);
    const shuffledRooms = shuffle(rooms);

    const timetable = [];

    for (const slot of slots) {
      if (timetable.length >= targetClasses) break;
      if (slot.time === LUNCH_BREAK) continue;

      const selectedCourse =
        shuffledCourses[Math.floor(Math.random() * shuffledCourses.length)];

      // Prefer faculty with expertise
      const availableFaculty = shuffledFaculty.filter((f) =>
        (f.expertise || []).some(
          (exp) =>
            selectedCourse.title.toLowerCase().includes(exp.toLowerCase()) ||
            exp.toLowerCase().includes(selectedCourse.title.toLowerCase())
        )
      );
      const facultyPool = availableFaculty.length
        ? availableFaculty
        : shuffledFaculty;

      let chosenFaculty = null;

      for (const f of facultyPool) {
        const fId = f._id.toString();
        const fName = facultyNameOf(f);
        const fKey = toKey(fName, slot.day, slot.time);

        const avail =
          (f.availability && f.availability[slot.day.toLowerCase()]) ||
          timeSlots;
        const isAvailableNow = avail.includes(slot.time);

        if (!isAvailableNow) continue;
        if (facultyAtSlot.has(fKey)) continue;
        if (workload.get(fId) >= maxPerFacultyTotal) continue;

        chosenFaculty = f;
        break;
      }

      if (!chosenFaculty) continue;

      // Find a free room
      let chosenRoom = null;
      for (const r of shuffledRooms) {
        const rKey = toKey(r.name, slot.day, slot.time);
        if (!roomAtSlot.has(rKey)) {
          chosenRoom = r;
          break;
        }
      }
      if (!chosenRoom) continue;

      // Mark occupancy
      const fName = facultyNameOf(chosenFaculty);
      facultyAtSlot.add(toKey(fName, slot.day, slot.time));
      roomAtSlot.add(toKey(chosenRoom.name, slot.day, slot.time));
      workload.set(
        chosenFaculty._id.toString(),
        workload.get(chosenFaculty._id.toString()) + 1
      );

      // Session type heuristic
      const isLabCourse = isLabLike(selectedCourse.title);
      const randomSessionType = isLabCourse
        ? Math.random() < 0.5
          ? "Lab"
          : "Theory"
        : "Theory";

      const classEntry = {
        course: `${selectedCourse.title}${
          isLabCourse ? ` (${randomSessionType})` : ""
        }`,
        course_code: selectedCourse.code,
        faculty: fName,
        faculty_id: chosenFaculty._id,
        room: chosenRoom.name,
        room_id: chosenRoom._id,
        day: slot.day,
        time: slot.time,
        batch_id: `Sem${
          selectedCourse.semester || Math.floor(Math.random() * 8) + 1
        }`,
        semester:
          selectedCourse.semester || Math.floor(Math.random() * 8) + 1,
      };

      timetable.push(classEntry);
    }

    const finalTimetable = shuffle(timetable);

    console.log(
      "🎉 Total realistic classes generated:",
      finalTimetable.length
    );

    const saved = await Timetable.create({
      version_name: `randomized_v${Date.now()}`,
      data: finalTimetable,
    });

    console.log("✅ Global timetable saved successfully");

    res.json({
      message: "AI timetable generated successfully",
      totalSessions: finalTimetable.length,
      timetable: saved.data,
    });
  } catch (err) {
    console.error("❌ Timetable generation error:", err);
    res.status(500).json({ message: "Generation failed", error: err.message });
  }
};

/* =========================
   3) Get latest timetable — uses createdAt
   ========================= */

export const getLatestTimetable = async (req, res) => {
  try {
    console.log('🔍 Fetching latest timetable...');

    // Prefer the most recent doc that actually has at least one session
    let latest = await Timetable.findOne({ "data.0": { $exists: true } })
      .sort({ createdAt: -1 });

    // If none have sessions, fall back to the most recent doc (may be empty)
    if (!latest) {
      latest = await Timetable.findOne().sort({ createdAt: -1 });
    }

    if (!latest) {
      console.log('⚠️ No timetable found in database');
      return res.status(404).json({ message: "No timetable found" });
    }

    console.log(
      '✅ Found timetable:',
      latest.version_name,
      'with',
      (latest.data?.length || 0),
      'sessions'
    );
    res.json({ data: latest.data || [] });
  } catch (err) {
    console.error('❌ Error fetching latest timetable:', err);
    res.status(500).json({ message: "Failed to fetch timetable", error: err.message });
  }
};

/* =========================
   4) Generate & save individual student timetable — corrected
   ========================= */

export const generateAndSaveStudentTimetable = async (studentId, courseIds) => {
  try {
    console.log("🔍 Fetching data for timetable generation...");
    console.log("Student ID:", studentId);
    console.log("Course IDs:", courseIds);

    const [courses, faculty, rooms, existingTimetables] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }),
      Faculty.find(),
      Room.find(),
      Timetable.find({}),
    ]);

    console.log(
      "📊 Data fetched - Courses:",
      courses.length,
      "Faculty:",
      faculty.length,
      "Rooms:",
      rooms.length
    );

    if (!courses.length) {
      console.error("❌ No courses found for IDs:", courseIds);
      throw new Error(`No courses found for the provided course IDs`);
    }

    if (!faculty.length) {
      console.error("❌ No faculty found in database");
      throw new Error(`No faculty available for assignment`);
    }

    if (!rooms.length) {
      console.error("❌ No rooms found in database");
      throw new Error(`No rooms available for assignment`);
    }

    // Build occupied maps (global + students)
    const facultyAtSlot = new Set();
    const roomAtSlot = new Set();

    existingTimetables.forEach((tt) => {
      (tt.data || []).forEach((session) => {
        const fName =
          session.faculty || session.faculty_name || session.faculty_id || "Faculty";
        const rName = session.room || session.room_id || "Room";
        const time = session.time || session.time_slot;
        if (session.day && time) {
          facultyAtSlot.add(toKey(String(fName), session.day, time));
          roomAtSlot.add(toKey(String(rName), session.day, time));
        }
      });
    });

    const timetable = [];
    const minClassesPerDay = 4;
    const workingDays = [...WORKING_DAYS];
    const dailySchedule = Object.fromEntries(workingDays.map((d) => [d, []]));

    // Assign (theory+lab) where needed
    for (const course of courses) {
      let assigned = 0;
      const isLabCourse = isLabLike(course.title);
      const sessionsNeeded = isLabCourse ? 2 : 1;

      // Prefer faculty with matching expertise
      const availableFaculty = faculty.filter((f) =>
        (f.expertise || []).some(
          (exp) =>
            course.title.toLowerCase().includes(exp.toLowerCase()) ||
            exp.toLowerCase().includes(course.title.toLowerCase())
        )
      );
      const facultyToTry = availableFaculty.length ? availableFaculty : faculty;

      for (let session = 0; session < sessionsNeeded && assigned < sessionsNeeded; session++) {
        // Choose days with fewer classes
        const sortedDays = [...workingDays].sort(
          (a, b) => dailySchedule[a].length - dailySchedule[b].length
        );

        let placed = false;

        for (const day of sortedDays) {
          if (placed) break;

          for (const selectedFaculty of facultyToTry) {
            const facultyName = facultyNameOf(selectedFaculty);
            const avail =
              (selectedFaculty.availability &&
                selectedFaculty.availability[day.toLowerCase()]) ||
              timeSlots;

            for (const timeSlot of avail) {
              if (timeSlot === LUNCH_BREAK) continue;

              const fKey = toKey(facultyName, day, timeSlot);
              if (facultyAtSlot.has(fKey)) continue;

              // pick a free room
              let chosenRoom = null;
              for (const r of rooms) {
                const rKey = toKey(r.name, day, timeSlot);
                if (!roomAtSlot.has(rKey)) {
                  chosenRoom = r;
                  break;
                }
              }
              if (!chosenRoom) continue;

              const sessionType = isLabCourse
                ? session === 0
                  ? "Theory"
                  : "Lab"
                : "Theory";

              const classEntry = {
                course: `${course.title}${isLabCourse ? ` (${sessionType})` : ""}`,
                course_code: course.code,
                faculty: facultyName,
                faculty_id: selectedFaculty._id,
                room: chosenRoom.name,
                room_id: chosenRoom._id,
                day,
                time: timeSlot,
              };

              timetable.push(classEntry);
              dailySchedule[day].push(classEntry);
              facultyAtSlot.add(fKey);
              roomAtSlot.add(toKey(chosenRoom.name, day, timeSlot));
              console.log(
                `✅ Assigned: ${course.title} ${sessionType} -> ${facultyName} -> ${day} ${timeSlot}`
              );
              assigned++;
              placed = true;
              break;
            }
            if (placed) break;
          }
        }
      }

      // Fallback assignment if still short
      while (assigned < sessionsNeeded) {
        const fallbackFaculty =
          faculty[Math.floor(Math.random() * faculty.length)];
        const sortedDays = [...workingDays].sort(
          (a, b) => dailySchedule[a].length - dailySchedule[b].length
        );
        const fallbackDay = sortedDays[0];
        const fallbackTime =
          timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const sessionType = isLabCourse
          ? assigned === 0
            ? "Theory"
            : "Lab"
          : "Theory";

        const facultyName = facultyNameOf(fallbackFaculty);

        const classEntry = {
          course: `${course.title}${isLabCourse ? ` (${sessionType})` : ""}`,
          course_code: course.code,
          faculty: facultyName,
          faculty_id: fallbackFaculty._id,
          room: room.name,
          room_id: room._id,
          day: fallbackDay,
          time: fallbackTime,
        };

        timetable.push(classEntry);
        dailySchedule[fallbackDay].push(classEntry);
        console.log(
          `✅ Fallback: ${course.title} ${sessionType} -> ${facultyName} -> ${fallbackDay} ${fallbackTime}`
        );
        assigned++;
      }
    }

    // Ensure minimum 4 classes per day (as in your code)
    workingDays.forEach((day) => {
      while (dailySchedule[day].length < minClassesPerDay && courses.length > 0) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        const randomFaculty = faculty[Math.floor(Math.random() * faculty.length)];
        const randomTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];

        const classEntry = {
          course: `${randomCourse.title} (Extra)`,
          course_code: randomCourse.code,
          faculty: facultyNameOf(randomFaculty),
          faculty_id: randomFaculty._id,
          room: room.name,
          room_id: room._id,
          day,
          time: randomTime,
        };

        timetable.push(classEntry);
        dailySchedule[day].push(classEntry);
        console.log(`✅ Extra class added: ${day} now has ${dailySchedule[day].length} classes`);
      }
    });

    // Save student timetable doc (one per student)
    console.log("💾 Saving timetable with", timetable.length, "sessions for student:", studentId);

    const savedTimetable = await Timetable.findOneAndUpdate(
      { student_id: studentId },
      {
        student_id: studentId,
        version_name: `student_${studentId}_${Date.now()}`,
        data: timetable,
      },
      { upsert: true, new: true }
    );

    console.log("✅ Timetable saved successfully. Document ID:", savedTimetable._id);

    return timetable;
  } catch (error) {
    console.error("Timetable generation error:", error);
    throw error;
  }
};

/* =========================
   5) Get student timetable (for UI grid) — unchanged shape
   ========================= */

export const getStudentTimetable = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get saved timetable for this student
    const savedTimetable = await Timetable.findOne({ student_id: userId });

    if (!savedTimetable || !savedTimetable.data.length) {
      return res.json([]);
    }

    // Format for frontend display
    const dayMapping = {
      Mon: "monday",
      Tue: "tuesday",
      Wed: "wednesday",
      Thu: "thursday",
      Fri: "friday",
      Sat: "saturday",
    };

    const formattedTimetable = timeSlots.map((time) => {
      const slot = { time };
      days.forEach((day) => {
        const dayKey = dayMapping[day];
        const session = savedTimetable.data.find(
          (t) => t.day === day && (t.time || t.time_slot) === time
        );
        slot[dayKey] = session ? session.course : null;
      });
      return slot;
    });

    res.json(formattedTimetable);
  } catch (error) {
    console.error("Student timetable error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   6) Update latest timetable
   ========================= */

export const updateTimetable = async (req, res) => {
  try {
    const { data } = req.body;
    const latest = await Timetable.findOne().sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({ message: "No timetable found" });
    }

    latest.data = Array.isArray(data) ? data : [];
    await latest.save();

    res.json({ message: "Timetable updated successfully", data: latest.data });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
