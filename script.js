document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadContacts();
});

document.getElementById('loginButton').addEventListener('click', function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginError = document.getElementById('loginError');

    // Clear previous error messages
    loginError.textContent = '';

    // Basic validation
    if (username === "" || password === "") {
        loginError.textContent = 'Username and Password cannot be empty!';
        return;
    }

    // Check if the username and password are correct
    if (username === "xyz" && password === "778899") {
        // Save login status to local storage
        localStorage.setItem('isLoggedIn', 'true');

        // Hide login section and show contact section
        showContactSection();
    } else {
        // Show error message
        loginError.textContent = 'Incorrect username or password!';
    }
});

document.getElementById('addContact').addEventListener('click', function() {
    const name = document.getElementById('name').value.trim();
    const number = document.getElementById('number').value.trim();

    if (name === "" || number === "") {
        alert("Please fill out both fields.");
        return;
    }

    addContactToList(name, number);
    saveContactToLocalStorage(name, number);

    // Clear the input fields after adding the contact
    document.getElementById('name').value = '';
    document.getElementById('number').value = '';
});

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn'); // Only remove the login status
    location.reload(); // Refresh page to reset to login view
});

document.getElementById('searchBar').addEventListener('input', function() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    filterContacts(query);
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showContactSection();
    }
}

function showContactSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('contactSection').style.display = 'block';
}

function addContactToList(name, number) {
    const contactList = document.getElementById('contactList');
    const li = document.createElement('li');
    li.setAttribute('data-name', name.toLowerCase()); // Store the name in lowercase for searching
    li.setAttribute('data-number', number.toLowerCase()); // Store the number in lowercase for searching

    const contactText = document.createElement('span');
    contactText.textContent = `${name}: ${number}`;

    const callBtn = document.createElement('a');
    callBtn.href = `tel:${number}`;
    callBtn.textContent = 'Call';
    callBtn.classList.add('call-btn'); // Add a class for styling
    callBtn.style.marginLeft = '10px';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('remove-btn'); // Add a class for styling

    removeBtn.addEventListener('click', function() {
        showModal(() => {
            contactList.removeChild(li);
            removeContactFromLocalStorage(name, number);
        });
    });

    li.appendChild(contactText);
    li.appendChild(callBtn);
    li.appendChild(removeBtn);
    contactList.appendChild(li);
}

function showModal(onConfirm) {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';

    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    confirmYes.onclick = function() {
        modal.style.display = 'none';
        onConfirm();
    };

    confirmNo.onclick = function() {
        modal.style.display = 'none';
    };
}

function saveContactToLocalStorage(name, number) {
    let contacts = getContactsFromLocalStorage();
    contacts.push({ name: name, number: number });
    contacts = sortContacts(contacts); // Sort contacts before saving
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function getContactsFromLocalStorage() {
    let contacts = localStorage.getItem('contacts');
    if (contacts) {
        return JSON.parse(contacts);
    } else {
        return [];
    }
}

function loadContacts() {
    let contacts = getContactsFromLocalStorage();
    contacts = sortContacts(contacts); // Sort contacts before displaying
    contacts.forEach(contact => {
        addContactToList(contact.name, contact.number);
    });
}

function removeContactFromLocalStorage(name, number) {
    let contacts = getContactsFromLocalStorage();
    contacts = contacts.filter(contact => contact.name !== name || contact.number !== number);
    contacts = sortContacts(contacts); // Sort contacts after removal
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function sortContacts(contacts) {
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

function filterContacts(query) {
    const contactList = document.getElementById('contactList');
    const contacts = contactList.getElementsByTagName('li');

    for (let i = 0; i < contacts.length; i++) {
        const name = contacts[i].getAttribute('data-name');
        const number = contacts[i].getAttribute('data-number');

        if (name.includes(query) || number.includes(query)) {
            contacts[i].style.display = '';
        } else {
            contacts[i].style.display = 'none';
        }
    }
}

document.getElementById('importContacts').addEventListener('click', async function() {
    if ('contacts' in navigator && 'select' in navigator.contacts) {
        try {
            const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });

            contacts.forEach(contact => {
                const name = contact.name && contact.name[0] ? contact.name[0] : 'Unknown';
                const number = contact.tel && contact.tel[0] ? contact.tel[0] : 'Unknown';

                // Add contact to the list and local storage
                addContactToList(name, number);
                saveContactToLocalStorage(name, number);
            });

            alert('Contacts imported successfully!');
        } catch (error) {
            console.error('Error accessing contacts:', error);
            alert('Could not access contacts. Please ensure permissions are granted.');
        }
    } else {
        alert('Contact import is not supported on this device or browser.');
    }
});