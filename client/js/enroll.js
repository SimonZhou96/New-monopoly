
function click_Button_enroll() {

	var account = document.getElementById("un");
	var pw = document.getElementById("pw");
	var pw2 = document.getElementById("pw2");

	account_value = account.value;
	//此处开始判断用户名是否符合规则
	var reg = new RegExp("^[0-9]+$");
	if (reg.test(account_value)) {
		alert("you cannot only input number");
	}
	else {
		//先判断密码是否为空
		if (pw.value.trim() != "") {
			//再判断密码是否少于六位
			if (pw.value.length >= 6) {
				//进一步判断密码长度是否少于六位
				if (pw.value == pw2.value) {
					console.log('success');
					localStorage.setItem('try_enroll', true);
					$.ajax({
						"type": 'post',
						"url": "/enroll",
						"dataType": "json",
						"data": {
							username: account_value,
							password: pw.value
						},
						"success": function (resp) {
							console.log(resp);
							if (resp.success) {
								alert('Enroll successfully');
								location.href = "/";
							} else {
								alert('Enroll failed! Username existed');
							}
						},
						"error": function (emsg) {
							console.log(emsg);
							alert('Post failed');
						}
					});
				}
				else {
					alert('is not matched!');
				}
			} else {
				alert("the password length must be 6 or more!");
			}
		}
		else {
			alert("the password is null!");
		}
	}
}
