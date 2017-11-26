let $navUser = $("#profile_nav"); //$ não é de PHP rs

$.get('users/'+OBJ_ACCOUNT.user+'.json',function(data){
  console.log(data);
});

function script(voce){
  $navUser.html("<img id='user-img' src='"+ voce.pic +"' width='40' height='40' alt=''> "+voce.nome);
  console.log(voce);

  if(voce.interesses.constructor != Array) voce.interesses = [voce.interesses];
  console.log(voce.interesses);

  voce.interesses.forEach(function(like){
    $('#user-likes').append("<li>"+like+"</li>");
  });

}

console.log( "veio aq");

$('#options-icon').click(function(){
  if($('#options').css('display') == 'none') $('#options').css('display','block');
  else $('#options').css('display','none');
});

$('#nav').load('nav.html');

searchPosts(function(posts){
  for (let post of posts) {
    console.log(post);
    loadPost(post,function(data){
      console.log(data);
    });
  }
});
