const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../../trackedClasses.json');

function loadTracked() {
   try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
   } catch {
      return [];
   }
}

function saveTracked(data) {
   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function termCodeFromSemester(semester) {
   const map = {
      summer: '2254',
      fall: '2257'
   };
   return map[semester];
}

function addTrackedClass(userId, classNumber, termCode) {
   const tracked = loadTracked();
   const exists = tracked.find(e => e.userId === userId && e.classNumber === classNumber && e.termCode === termCode);
   if (exists) return false;
   tracked.push({ userId, classNumber, termCode, lastAvailable: null });
   saveTracked(tracked);
   return true;
}

function removeTrackedClass(userId, classNumber, termCode) {
   let tracked = loadTracked();
   const initialLength = tracked.length;
   tracked = tracked.filter(entry => !(entry.userId === userId && entry.classNumber === classNumber && entry.termCode === termCode));
   saveTracked(tracked);
   return tracked.length < initialLength;
}

function listTrackedClasses(userId) {
   return loadTracked().filter(entry => entry.userId === userId);
}

module.exports = {
   addTrackedClass,
   removeTrackedClass,
   termCodeFromSemester,
   loadTracked,
   listTrackedClasses
};