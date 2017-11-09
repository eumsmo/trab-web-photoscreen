$('#send').click(function(){
  let username = $('#username_input').val(),
      user = {nome: username, senha: $('#password_input').val(), email: $('#email_input').val()};

  post(user,'/inscrever_dados',function(data){
    //Caso retorne falso, será alertado a mensagem com o erro
    if(!data[0]) alert(data[1]);
    else{
      let login_inf = btoa(JSON.stringify({user: data[1].id ,pass: user.senha}));
      sessionStorage.setItem('data',login_inf);
      location.replace('index.html');
    }
    console.log(data);

  });

});
