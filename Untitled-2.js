import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 1️⃣ تهيئة Firebase باستخدام config الجديد
const firebaseConfig = {
  apiKey: "AIzaSyBoa6QavntkOM4zmBIGpMAgAAX7dO1eQtg",
  authDomain: "magnetic-digital-lab-43740.firebaseapp.com",
  projectId: "magnetic-digital-lab-43740",
  storageBucket: "magnetic-digital-lab-43740.firebasestorage.app",
  messagingSenderId: "900691908013",
  appId: "1:900691908013:web:6c538ad37a8173c592bd24"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 2️⃣ إضافة حالة
function addCaseFromForm() {
  const caseData = {
    patientName: document.getElementById('patientName').value,
    doctor: document.getElementById('doctor').value,
    toothColor: document.getElementById('toothColor').value,
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value,
    createdAt: Date.now()
  };
  const casesRef = ref(database, 'cases');
  const newCaseRef = push(casesRef);
  set(newCaseRef, caseData)
    .then(() => document.getElementById('add-case-form').reset?.())
    .catch(err => alert('حدث خطأ: ' + err));
}

// 3️⃣ عرض الحالات مع البحث
const casesRef = ref(database, 'cases');
onValue(casesRef, (snapshot) => displayCases(snapshot.val()));

function displayCases(cases) {
  const list = document.getElementById('cases-list');
  list.innerHTML = '';
  const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
  for(const id in cases) {
    const c = cases[id];
    if(
      c.patientName.toLowerCase().includes(searchTerm) ||
      c.doctor.toLowerCase().includes(searchTerm) ||
      c.toothColor.toLowerCase().includes(searchTerm) ||
      c.status.toLowerCase().includes(searchTerm)
    ) {
      const div = document.createElement('div');
      div.classList.add('case-item');
      div.innerHTML = `
        <strong>${c.patientName}</strong> - ${c.doctor} - ${c.toothColor} - ${c.status} 
        <button onclick="deleteCase('${id}')">حذف</button>
        <button onclick="editCasePrompt('${id}')">تعديل</button>
        <p>${c.notes}</p>
      `;
      list.appendChild(div);
    }
  }
}

document.getElementById('search').addEventListener('input', () => {
  onValue(casesRef, snapshot => displayCases(snapshot.val()));
});

// 4️⃣ حذف حالة
window.deleteCase = function(id) {
  if(confirm('هل تريد حذف هذه الحالة؟')) {
    const caseRef = ref(database, 'cases/' + id);
    remove(caseRef);
  }
}

// 5️⃣ تعديل حالة
window.editCasePrompt = function(id) {
  const cRef = ref(database, 'cases/' + id);
  const patientName = prompt("اسم المريض:");
  const doctor = prompt("اسم الطبيب:");
  const toothColor = prompt("لون الأسنان:");
  const status = prompt("الحالة:");
  const notes = prompt("الملاحظات:");
  update(cRef, { patientName, doctor, toothColor, status, notes });
}

// 6️⃣ تصدير Excel
window.exportExcel = function() {
  onValue(casesRef, snapshot => {
    const data = snapshot.val();
    const worksheet = XLSX.utils.json_to_sheet(Object.values(data || {}));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    XLSX.writeFile(workbook, "cases.xlsx");
  }, { onlyOnce: true });
}

// 7️⃣ تصدير PDF
window.exportPDF = function() {
  onValue(casesRef, snapshot => {
    const data = snapshot.val();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    for(const id in data) {
      const c = data[id];
      doc.text(`اسم المريض: ${c.patientName}`, 10, y); y += 6;
      doc.text(`الطبيب: ${c.doctor}`, 10, y); y += 6;
      doc.text(`لون الأسنان: ${c.toothColor}`, 10, y); y += 6;
      doc.text(`الحالة: ${c.status}`, 10, y); y += 6;
      doc.text(`ملاحظات: ${c.notes}`, 10, y); y += 10;
    }
    doc.save("cases.pdf");
  }, { onlyOnce: true });
}
