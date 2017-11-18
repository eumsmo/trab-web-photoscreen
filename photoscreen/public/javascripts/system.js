//Função mais bonitinha pra não repetição de codigos. Função: post em AJAX; (Dependente de JQUERY)
function post(value, where, callback){
  $.post(where,value,function(data){
    callback(data);
  });
}

//Pegar imagem do input e transformar em dados/string com link, usando a API FileReader
//Se não especificado, sempre retorna a imagem convertida em JPG
function carregaImagem(input,func,toJPG = true){

  function imgConverteJPG(data,callback = new Function){
     let canvas = document.createElement("canvas"),
         img = new Image();
     img.src = data;
     canvas.width = img.width;
     canvas.height = img.height;
     img.onload = function(){
       canvas.getContext("2d").drawImage(img, 0, 0);
       callback(canvas.toDataURL("image/jpeg",1));
     }
   }

  console.log(input);
  let file = input.files[0],
      fr = new FileReader();
  fr.addEventListener('load',function(resultado){

    if(!resultado.target.result.search("data:image/jpeg") && toJPG){
      imgConverteJPG(resultado.target.result,function(data){
        imgConverteJPG(resultado.target.result,function(data){
            func(data);
        });
      });
    }

    else func(resultado.target.result);
  });
  fr.readAsDataURL(file);
}

/* Testa login e chama as funções de callback */
function login(result,request,wrong = new Function()){
  post(request,'/login_dados',function(data){
    if(!data || !data[0]) wrong(data[1]);
    else if(data[0]) result(data[1]);
  });
}

function postByInput(input, conteudo, informacao, request,func){
  carregaImagem(input,function(data){
    informacao.tipo = 'post';
    conteudo.url = data;
    postPost(conteudo,informacao,request,func);
  },true);
}

function postPost(conteudo,informacao,request,func){
    login(function(id){
      let  obj = { url: conteudo.url, texto: conteudo.texto,titulo: conteudo.titulo , categorias: conteudo.categorias ,inf: informacao};
      console.log(obj);
      post({require: JSON.stringify(request), content: JSON.stringify(obj)},'/post',function(data){
        console.log(data);
      });

    },request);


}

function comentar(require, postId, comentario, callback){
  let obj = {
    require: JSON.stringify(require),
    comentario: comentario,
    id: postId
  };

  post(obj,'/comentar',function(data){
    callback(data);
  })
}

function alterar(require,oque,conteudo,callback){
  let obj={
    require: JSON.stringify(require),
    what: oque,
    conteudo: JSON.stringify(conteudo)
  };

  $.post('/alterar',obj,function(data){
    console.log(data);
  });
}

class ler{
  constructor() {}

  static comentario(link, callback){
    $.get(link, function(ret){
      let obj = {
        texto: ret.texto,
        por: ler.idToUser(ret.inf.por),
        onde: ret.inf.onde,
        id: ret.id
      };

      callback(obj);
    });
  }

  static texto(string, callback){
    //Separar as palavras de um texto/string
    let array = string.split(' ');

    //Rodar um for para cada palavra
    for (let palavra of string){

      //Se a palavra iniciar com @ ...
      if(palavra[0] == '@'){
        let param = palavra.slice(1);
        $.get('/get/user/'+param, function(data){

        });
      }
    }

  }

  static idToUser(id,callback){
    $.get('/get/nome/'+id, function(data){
      callback(data);
    });
  }

  static profilePic(id,callback){
    $.get('/get/foto_perfil/'+id,function(data){
      callback(data);
    });
  }
}

function loadPost(postId,callback){
  const encontrarPost = 'main.post-holder';

  $.get('posts.html?'+postId,function(data){
    let html = $.parseHTML(data),
        $created = $(html).find(encontrarPost),
        $newHolder = $('<div class="col s3">\n<div class="card">\n<div class="post-hold">\n</div>\n</div>\n</div>');


        $created.find('main.post-holder').addClass('floating');
        $created.find('.imagem-descricao p').css('border-radius',$('.imagem-descricao img').css('border-radius'));
        $created.find('.imagem-descricao p').css('height',$('.imagem-descricao img').css('height'));
        $created.find('.imagem-descricao').click(function(){
          location.assign('posts.html?'+postId);
        });

        $('.interacao p').click(function(){
          if($(this).hasClass('curtir')){
            console.log('call curtir');
            $(this).find('i.material-icons').html('favorite_border');
          }
          else if($(this).hasClass('comentar')){
            console.log('call comentar');
          }
        });

        $.get('/post/'+postId+'.json',function(data){
          console.log(data);
          $created.find('.imagem-descricao img').attr('src','post/'+postId+'.jpg');
          $created.find('.imagem-descricao #descricao').html(data.texto);
          $created.find('.post-inf h1').html(data.titulo);

          ler.idToUser(data.inf.por,function(ret){
            console.log(ret);
            $created.find('.post-inf footer> p').html('<a href="perfil.html?'+data.inf.por+'">~'+ret+'</a>');
          });

        });
        $created.addClass('floating');
        $newHolder.find('.post-hold').append($created);
        $('body main .row').append($newHolder);

  });
}

function searchPosts(callback){
  $.get('/search/posts/all/all',function(data){
    if(!data[0]) throw data[1];
    else callback(data[1]);
  });
}

function helpServerOut(){
  let obj ={
    user: 'admin',
    senha: 'admin'
  };
  localStorage.setItem('data', btoa(JSON.stringify(obj)));
}

function navValues(obj){
  ler.idToUser(obj.user,function(a){
      $('p#nome-usuario').html(a);
  });
  ler.profilePic(obj.user,function(a){
    $('#foto-usuario')[0].src = a;
  });
}
