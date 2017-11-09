
/* REQUIRE */
let express = require('express'),
    path = require('path');

let router = express.Router();

/* REQUIRE models*/
let models = {
      login: require('./../model/login')() ,
      post: require('./../model/post')(),
      userInf: require('./../model/user_inf')()
    };



function getIdbyString(string,callback){
  models.login.find({$or: [{nome: string}, {email: string}]}, function(err,data){
    if(err) callback([false,"Erro durante processo"]);
    else if(!data[0]) callback([false,"Usuario não existe!"]);
    else callback([true,data[0].id]);
  });
}

router.get('/get/:what/:id',function(req,res,next){
  let what = req.params.what,
      id = req.params.id;
  console.log(what);
  console.log(id);
  if(what == 'id'){
    getIdbyString(id,function(data){
      if(data[0]) res.send(String(data[1]));
      else res.send(false);
    });
  }

  if(what == 'nome'){
    models.userInf.find({id: id},'',function(err,data){
      if(err || data[0] == undefined) res.send(false);
      else res.send(data[0].inf.nome);
    });
  }

})

/* FUNCTION login */
function login(require,callback){
  console.log(require);
  let userId = require.user;

  if(Number(userId) == NaN){
    console.log(userId);
    getIdbyString(userId,function(data){
      if(data[0]){
        userId = data[1];
        continuarLogin();
        return;
      }
      else callback(data);
    });
  }
  else continuarLogin();


  // Função, vulgo resto do codigo.
  function continuarLogin(){
    userId = Number(userId);

    // Procura um usuario com mesmo nome que o parametro.nome
    models.login.find({id: userId},function(err,found){
      // Caso erro, abortar
      if(err) callback([false,err]);
      else{
        if(found[0] == undefined ) callback([false,"Usuario Errado"]);
        else{
          // Caso a senha requerida seja igual a do Banco de Dados...
          if( require.pass == found[0].senha) callback([true,found[0].id]); //Retorna usuario.
          else callback([false,"Senha Errado"]); // Retorna falso.
        }
      }
    });
  }

}

/* FUNCTION postCategorias */
function postCategorias(arrayCateg,postId,require,callback){

}

/* FUNCTION post pertence a usuario */
function pertenceUsuario(require, id, callback){
  login(require,function(returned){
    if(!returned[0]){callback([false,"Login errado"]); return;}
    models.post.find({id: id},function(err,data){
      if(err) callback([false,err]);
      else if(data[0] == undefined) callback([false,"Post não existe!"]);
      else{
        if(data[0].inf.por == returned[1]) callback([true,data[0]]);
        else callback([false, "Post nao pertence ao usuario."]);
      }
    });
  });
}

/* FUNCTION alterarPost */
function alterarPost(postId, obj,require, callback){
  pertenceUsuario(require, postId, function(data){
    if(!data[0]){ callback(data); return;}
    let inf = data[1];

    switch (inf.inf.tipo){
      case 'imagem':
        inf.url = (obj.url)? obj.url: inf.url;
        inf.inf.titulo = (obj.titulo)? obj.titulo: inf.inf.titulo;
      case 'texto':
      case 'comentario':
        inf.texto = (obj.texto)? obj.texto: inf.texto;
        break;
    }

    models.post.findOneAndUpdate({id: inf.id},inf,function(err,returned){
      if(err) callback([false,err]);
      else callback([true,returned]);
    });
  });
}

/* GET home page.  */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/../public/index.html'));
});

/* GET login page */
router.get('/login', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/../public/login.html'));
});

/* GET singup page */
router.get('/cadastro', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../public/inscrever.html'));
});


/* LOGIN - INSCREVER */

  /* POST dados de login */
  router.post('/login_dados',function(req,res,next){
    let dados = req.body;

    // Inicia a função login com os dados de login
    login(dados,function(result){

      //Retorna ao usuario o valor retornado por callback
      res.send(result);
    });

  });

  /* POST dados de inscrição */
  router.post('/inscrever_dados', function(req, res, next) {
    let dados = req.body,
        nome = dados.nome;

    // Procura usuario com o nome enviado...
    models.login.find({nome: nome},function(error, val){
      if(error) {
        res.send([false,error,"1"]);
        return;
      }

      // Caso houver um usuario com o mesmo nome, retorna falso, caso o contrario, continua.
      if(val.length) res.send([false,"Usuario já existe!","2"]);
      else{

        // Cria o usuario com as informações (nome, email e senha).
          models.login.create(dados, function(err,logged){
            if(err) {
              res.send([false,err,"4"]);
              return;
            }

            // Cria dados "default" para o usuario
            let defaultInf = {
                nome: logged.nome,
                foto_perfil: '/images/undefined.jpg',
                seguindo: [],
                seguidores: [],
                interesses: [],
                pics: []
            };

            // Organiza o modelo com o id e as informações
            let model = {id: logged.id, inf: defaultInf, extras: {}};

            // Coloca dados no MongoDB
            models.userInf.create(model,function(err, returned){
              if(err) res.send([false,err,"5"]);

              // Retorna os dados para o usuario.
              res.send([true,returned]);
            });

          });
      }
    });

  });


/* UPLOAD DE FOTO */


function postAPost(require, content, callback){
  /* Testa login */
  login(require,function(result){
    /* Se incorreto, retorna mensagem. */
    if(!result[0]){ callback([false,'Login incorreto.']); return;};

    content.inf.data = Date.now();
    content.inf.por = result[1];
    models.post.create(content,function(err,returned){
      if(err) callback([false,err]);
      if(returned.inf.tipo != 'comentario'){
        models.userInf.findOneAndUpdate({id: returned.inf.por}, {$push: {"inf.posts": returned.id}},function(err,data){
          if(err) callback([false,err]);
          else  callback([true,data]);
        });
      }
      else{
        callback([true,returned]);
      }
    });
  });
}
/* POST post */
router.post('/post',function(req,res,next){
  let require = JSON.parse(req.body.require),
      content = JSON.parse(req.body.content);

  content.interacao = {
    curtidas: [],
    compartilhadas: [],
    comentarios: []
  };


  postAPost(require,content, function(data){
    res.send(data);
  });
});

function deleteAPost(require, id, callback){
  /* LOGA NA CONTA E PEGA ID */
  login(require,function(data){
    if(!data[0]){callback(data); return;}

    /* CONFERE SE POST PERTENCE A USUARIO */
    pertenceUsuario(require, id, function(ret){
      if(!ret[0]){callback(ret); return;}

      /* PROCURA O POST A SER DELETADO */
      models.post.find({id: id},function(err,data){
        if(err){callback([false,err]); return;}

        /* DELETA POST */
        models.post.remove({id: id}, function(err){
          if(err) callback([false,err]);
          else callback([true,data]);
        });
      });
    });
  })
}

function deleteComentario(require, id, callback){
  /* PEGAR ID DO USUARIO */
  login(require,function(data){
    if(!data[0]){callback(data); return;}
    let idUsuario = data[1];

    /* PEGAR ID DO AUTOR DO COMENTARIO */
    models.post.find({id: id},"inf",function(err,data1){
      if(err){callback([false,err]); return;}
      let idAutorCom = data1[0].inf.por;

      /* PEGAR ID DO AUTOR DO POST COMENTADO */
      models.post.find({id: data1[0].inf.onde},"inf",function(err,data2){
        if(err){callback([false,err]); return;}
        let idAutorPost = data2[0].inf.por;

        /* COMPARAR SE USUARIO TEM PERMISSÃO SUFICIENTE, CASO O CONTRARIO RETORNA CALLBACK COM FALSE */
        if(idUsuario != idAutorCom && idUsuario != idAutorPost){
          callback([false,"Usuario não tem permissão para apagar comentario."]);
          return;
        }

        /* REMOVE COMENTARIO */
        models.post.remove({id: id},function(err,data){
          if(err) callback([false,err]);
          else callback([true,data]);
        });

      });
    });
  });
}

/* POST deletar post/comentario */
/* { require : '{ user , pass }' , id }*/
router.post('/delete_:what',function(req,res,next){
  let require = JSON.parse(req.body.require);
  login(require,function(data){
    if(!data[0]){res.send(data); return;}

      /* SE WHAT FOR IGUAL A POST */
      if(req.params.what == 'post'){

        /* CHAMA FUNÇÃO DE DELETAR POST */
        deleteAPost(require, req.body.id, function(result){
          if(!result[0]){ res.send(result); return;}

          /* TIRA POST DA LISTA DE POSTS DO USUARIO */
          models.userInf.findOneAndUpdate({id: data[1]},{$pull: { "inf.posts": req.body.id}},function(err,data){
            if(err) res.send([false,err]);
            else res.send([true, data]);
          });
        });

      }

      /* SE WHAT FOR IGUAL A COMENTARIO */
      if(req.params.what == 'comentario'){
        deleteComentario(require,req.body.id,function(data){
          res.send(data);
        });
      }

  });

});

/* POST comentar */
router.post('/comentar',function(req,res,next){
  let require = JSON.parse(req.body.require);

  /* LOGA NA CONTA DO USUARIO */
  login(require,function(data){
    if(!data[0]){ res.send(data); return;}

    /* CRIA OBJETO COMENTARIO E SUAS INFORMAÇÕES */
    let comentario = {
      texto: req.body.comentario,
      inf: {
        tipo: 'comentario',
        onde: req.body.id
      },
    };

    /* POSTA COMENTARIO COMO SE FOSSE UM POST */
    postAPost(require,comentario, function(data){
      if(!data[0]){res.send(data); return;}

      /* ADICIONA COMENTARIO AO ARRAY DO JSON DE INFORMAÇÃO DO POST */
      models.post.findOneAndUpdate({id: req.body.id},{ $push: {"interacao.comentarios":  data[1].id}},function(err,result){
        if(err){ res.send([false,err]); return;}
        res.send([true,result,data]);
      });
    });
  });
});

router.post('/alterar',function(req,res,next){
  let loginReq = JSON.parse(req.body.require);

  login(loginReq,function(data){
    if(!data[0]){ res.send(data); return;}
    let oque = req.body.what,
        conteudo = JSON.parse(req.body.conteudo);

    if(oque == 'user_infs'){
      if(conteudo.seguindo != undefined || conteudo.seguidores != undefined || conteudo.nome != undefined || conteudo.posts != undefined){
        res.send([false,"Não se pode alterar esses valores por esse metodo!"]);
        return;
      }

      function objFormatMongo(nome,obj){
        let nobj = {};
        for (let prop in obj) {
          if(obj[prop].constructor == Object)
            nobj = Object.assign(nobj,objFormatMongo(nome+'.'+prop, obj[prop]));
          else nobj[nome+'.'+prop] = obj[prop];
        }
        return nobj;
      }
        conteudo = objFormatMongo('inf',conteudo);
        console.log(conteudo);
        models.userInf.findOneAndUpdate({id: data[1]},conteudo, function(err,retornado){
          if(err) res.send([false,err]);
          else res.send([true, retornado])
        });
    }
  });
});

/* POST seguir */
/* { require : '{ user , pass }' , id } */
router.post('/seguir',function(req,res,next){
  let require = JSON.parse(req.body.require);

  login(require,function(data){
    if(!data[0]){ res.send(data); return;}
    models.userInf.find({ id: req.body.id},"inf.seguidores", function(err,inf){
      if(err){ res.send([false,err]); return;}
      else if(inf[0] == undefined){res.send([false,"Usuario não existe"]); return;}

      let comIndex = inf[0].inf.seguidores.indexOf(data[1]);

      if(comIndex < 0){
        models.userInf.findOneAndUpdate({id: req.body.id},{ $push: {"inf.seguidores": data[1]}}, function(err){
          if(err){ res.send([false,err]); return;}
          models.userInf.findOneAndUpdate({id: data[1]},{ $push: {"inf.seguindo": req.body.id}}, function(err,data){
            if(err) res.send([false,err]);
            else res.send([true,data]);
          });
        });
      }
    });
  });
});

/* POST parar de seguir */
/* { require : '{ user , pass }' , id } */
router.post('/desseguir',function(req,res,next){
  let require = JSON.parse(req.body.require);

  login(require,function(data){
    if(!data[0]){ res.send(data); return;}

    models.userInf.findOneAndUpdate({id: req.body.id},{$pull: {"inf.seguidores": data[1]}},function(err){
      if(err){ res.send([false,err]); return;}
      models.userInf.findOneAndUpdate({id: data[1]},{$pull: {"inf.seguindo": req.body.id}},function(err,data){
        if(err) res.send([false,err]);
        else res.send([true,data]);
      });
    });
  });
});

/* POST curtir */
/* { require : '{ user , pass }' , id } */
router.post('/curtir',function(req,res,next){
  let require = JSON.parse(req.body.require);

  login(require,function(data){
    if(!data[0]){ res.send(data); return;}
    models.post.find({ id: req.body.id},"interacao.curtidas", function(err,inf){
      if(err){ res.send([false,err]); return;}
      else if(inf[0] == undefined){res.send([false,"post não existe"]); return;}
      let comIndex = inf[0].interacao.curtidas.indexOf(data[1]);

      if(  comIndex < 0){
        models.post.findOneAndUpdate({id: req.body.id},{ $push: {"interacao.curtidas": data[1]}}, function(err,data){
          if(err) res.send([false,err]);
          else res.send([true,data]);
        });
      }
    });
  });
});

/* POST descurtir */
/* { require : '{ user , pass }' , id } */
router.post('/descurtir',function(req,res,next){
  let require = JSON.parse(req.body.require);

  login(require,function(data){
    if(!data[0]){ res.send(data); return;}

    models.post.findOneAndUpdate({id: req.body.id},{$pull: {"interacao.curtidas": data[1]}},function(err,data){
      if(err) res.send([false,err]);
      else res.send([true,data]);
    });
  });
});

/* CONTROLE POR GET */
router.get('/:what/:id.:type',function(req,res,next){
  let id = req.params.id,
      type = req.params.type,
      what = req.params.what,
      send;
      console.log(req.params);
  if(what == 'post'){
    models.post.find({id: id},function(err,post){

      if(err) {
        res.send(err);
        return;
      }

      if(type == 'jpg' || type == 'jpeg'){
        if(!post[0] || !post[0].url){res.send(); return;}
        let data = post[0].url.replace("data:image/jpeg;base64,",''),
            imagem = Buffer.from(data,'base64');

        res.writeHead(200, {'Content-Type': 'image/jpeg','Content-Length': imagem.length});
        res.write(imagem);
        res.end();

      }
      else if(type == 'inf'){
        if(post[0] != undefined)
          res.send(post[0].inf);
      }
      else if(type == 'val'){
        if(post[0] != undefined)
          res.send(post[0].interacao);
      }
      else if(type == 'json'){
        let json = post[0];
        if(json != undefined) json.url = undefined;
        res.send(json);
      }

    });
  }
  if( what == 'users'){
    models.userInf.find({id: id},function(err,user){
      if(err) res.send(err);
      if(user[0] == undefined) res.send(user[0]);
      else res.send(user[0].inf);
    });
  }

});



/* PESQUISAR POST POR */

module.exports = router;
