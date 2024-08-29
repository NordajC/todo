// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbPsxxejMd-tY0vTPClGMfi5Uid7CcqcA",
  authDomain: "todo-1bd6c.firebaseapp.com",
  databaseURL: "https://todo-1bd6c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todo-1bd6c",
  storageBucket: "todo-1bd6c.appspot.com",
  messagingSenderId: "74232147958",
  appId: "1:74232147958:web:22737b8c420d221f0361d7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDB = getDatabase(app);


document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  // Add a to-do
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (input.value.trim() !== "") {
      const docRef = await addDoc(collection(db, "todos"), {
        text: input.value,
        completed: false,
        createdAt: new Date()
      });
      // Add to Realtime Database for sync
      set(ref(realtimeDB, 'todos/' + docRef.id), {
        text: input.value,
        completed: false
      });
      input.value = '';
    }
  });

  //
  onSnapshot(collection(db, "todos"), (snapshot) => {
    todoList.innerHTML = ''; // Clear existing entries
    snapshot.forEach(docSnapshot => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        if (docSnapshot.data().completed) { 
            li.classList.add('checked');
        }

        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('input-checkbox');
        checkbox.checked = docSnapshot.data().completed;
        checkbox.onchange = () => {
            toggleComplete(docSnapshot.id, checkbox.checked);
            if (checkbox.checked) {
                li.classList.add('checked');
            } else {
                li.classList.remove('checked');
            }
        };
        groupDiv.appendChild(checkbox);

        const text = document.createElement('span');
        text.textContent = docSnapshot.data().text;
        if (docSnapshot.data().completed) {
            text.style.textDecoration = 'line-through';
        }
        groupDiv.appendChild(text);

        li.appendChild(groupDiv);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.classList.add('delete-button');
        deleteBtn.onclick = async () => {
            try {
                await deleteDoc(doc(db, "todos", docSnapshot.id));
                remove(ref(realtimeDB, 'todos/' + docSnapshot.id));
            } catch (error) {
                console.error("Error removing document: ", error);
            }
        };
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
    });
});




  // Function to toggle completion status
  async function toggleComplete(todoId, completed) {
    const todoRef = doc(db, "todos", todoId);
    await updateDoc(todoRef, {
      completed: completed
    });
    update(ref(realtimeDB, 'todos/' + todoId), {
      completed: completed
    });
  }
});
