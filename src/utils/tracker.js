const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../../trackedClasses.json');

function loadTrackedCourses() {
   try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
   } catch {
      return [];
   }
}

function saveTrackedCourses(data) {
   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


function trackCourse(userId, termCode, course, courseTitle, courseNumber) {
   const trackedCourses = loadTrackedCourses();
   const courseIsAlreadyTracked = trackedCourses.find(e => e.userId === userId && e.classNumber === courseNumber && e.termCode === termCode);
   if (courseIsAlreadyTracked) return false;
   trackedCourses.push({ userId, course, courseTitle, courseNumber, termCode, previousAvailableSeats: 0 });
   saveTrackedCourses(trackedCourses);
   return true;
}

function removeTrackedClass(userId, classNumber, termCode) {
   let tracked = loadTrackedCourses();
   const initialLength = tracked.length;
   tracked = tracked.filter(entry => !(entry.userId === userId && entry.classNumber === classNumber && entry.termCode === termCode));
   saveTrackedCourses(tracked);
   return tracked.length < initialLength;
}

function listTrackedClasses(userId) {
   return loadTrackedCourses().filter(entry => entry.userId === userId);
}

module.exports = {
   trackCourse,
   removeTrackedClass,
   loadTrackedCourses,
   listTrackedClasses
};