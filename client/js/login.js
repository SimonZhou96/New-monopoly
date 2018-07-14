function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    console.log(username, password);

    $.ajax({
        "type": 'post',
        "url": "/login",
        "dataType": "json",
        "data": {
            username: username,
            password: password
        },
        "success": function (resp) {
            console.log(resp);
            if (resp.success) {
                alert('Login successfully');
                location.href = "/lobby";
            } else {
                alert('Login failed! Wrong username or password');
            }
        },
        "error": function (emsg) {
            console.log(emsg);
            alert('Post failed');
        }
    });
}
