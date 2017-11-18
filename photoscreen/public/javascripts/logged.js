let RES = undefined;

//Pegar valor do localStorage se possivel, caso contrário, do sessionStorage;

const OBJ_ACCOUNT = (localStorage.getItem('data') != null)?   JSON.parse( atob(localStorage.getItem('data')) ) : (sessionStorage.getItem('data') != null)? JSON.parse( atob(sessionStorage.getItem('data')) ): undefined;
if(OBJ_ACCOUNT == undefined){
  RES = 'YourSelf';
  console.log('Logado em: '+RES);
  if(window.location.pathname != '/login.html' && window.location.pathname != '/pagina_inicial.html') window.location.assign('/pagina_inicial.html');
} else{
  //Função que irá iniciar quando o resultado da tentativa de login for retornado;
  login(function(resultado){
    RES = resultado;
    console.log('Logado em: '+RES);
    navValues(OBJ_ACCOUNT);
  },OBJ_ACCOUNT,function(data){
    console.log(data);
    if(window.location.pathname != '/login.html' && window.location.pathname != '/pagina_inicial.html') window.location.assign('/pagina_inicial.html');
  });
}

$('.sair').click(function(){
  localStorage.removeItem('data');
  sessionStorage.removeItem('data');
});
