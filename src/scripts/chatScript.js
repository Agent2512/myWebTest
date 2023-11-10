document.querySelector('#chatroom #form button').addEventListener('click', function (e) {
    setTimeout(() => {
        document.querySelector('#chatroom #form').reset();
    }, 1);
})

document.querySelector('#chatroom #form textarea').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.querySelector('#chatroom #form button').click();
    }
})


