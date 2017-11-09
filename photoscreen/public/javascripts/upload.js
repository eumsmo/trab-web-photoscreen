$('#upload_image_bt').click(function(){

      let input = $('#image_input')[0],
          inf = {
            tipo: 'post'
          },
          conteudo = {
              texto: $('#descript_input').val(),
              titulo: $("#titulo_input").val(),
              categorias: ($("#categories_input").val())? $("#categories_input").val().split(',') : undefined
          };
      console.log(inf);

      postByInput(input,conteudo,inf,OBJ_ACCOUNT,function(data){
        console.log(data);
      });
    });

$('#upload_texto_bt').click(function(){
  let conteudo = {
    texto: $('#descript_input').val(),
    categorias: ($("#categories_input").val())? $("#categories_input").val().split(',') : undefined
  }, inf = {
    tipo: 'post'
  };

  postPost(conteudo,inf,OBJ_ACCOUNT,function(data){
    console.log(data);
  });
});
