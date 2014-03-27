var agent = require("superagent");

var action = function(action,path){
    return agent[action]("http://127.0.0.1:8000/apis"+path)
        .set({"muon-request":"data-request"});
}

var get = m.utils._.partial(action,"get");
var del = m.utils._.partial(action,"del");
var put = m.utils._.partial(action,"put");
var post = m.utils._.partial(action,"post");

var crypto = require('crypto');

describe("permissions",function(){
    var User, Session;

    before(function(){
        User = m.app.models.user;
        Session = m.app.models.session;
    })

    before(function(done){
        m.server().listen(8000,"127.0.0.1",done);
    });
    after(function(done){
        m.server().close(done);
    });

    before(function(done){
        User.drop(function(){
            Session.drop(done);
        });
    });

    xdescribe("user",function(){
        describe("user create",function(){
            it("should create instance if there is no one",function(done){
                post("/user").send({nick: "user", password: "12345","email":"some@some.some"})
                    .end(function(res){
                        res.status.should.be.eql(200);
                        done();
                    })
            });

            it("should not create user if some already exists",function(done){
                post("/user").send({nick: "user1", password: "123456","email":"some1@some.some"})
                    .end(function(res){
                        res.status.should.be.eql(403);
                        done();
                    });
            });
            after(function(done){
                User.drop(done)
            });
        });

        describe("user get",function(){
            var users;

            before(function(done){
                User.create([{
                    "nick": "user1",
                    "password":"12345",
                    "email":"user1@host.org"
                },{
                    "nick": "user2",
                    "password":"123456",
                    "email":"user2@host.org"
                }],function(e,a){
                    users = a;
                    done();
                });
            })
            it("should get list of users",function(done){
                get("/user")
                    .end(function(res){
                        res.status.should.be.eql(200);
                        res.body.length.should.be.eql(users.length);
                        done();
                    });
            });
            it("should get instance",function(done){
                get("/user/"+users[0]._id)
                    .end(function(res){
                        res.status.should.be.eql(200);
                        expect(res.body).to.be.ok;
                        res.body.should.have.property("_id");
                        done();
                    });
            });
            it("should not remove instance",function(done){
                del("/user/"+users[0]._id)
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });
            it("should not edit instance",function(done){
                put("/user/"+users[0]._id)
                    .send({nick: "othername",password: "ohoho"})
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });
            it("/me should not be accessible",function(done){
                get("/user/me")
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(404);
                        done();
                    });
            });

            after(function(done){
                User.drop(done)
            });
        });
    })

    describe("session",function(){
        describe("base actions",function(){

            after(function(done){
                Session.drop(done);
            });

            var session = [], user;
            var session_id = "some_cookie";

            before(function(done){
                user = new User();
                user.nick = "user";
                user.password = "1234";
                user.email = "user@host.com";
                user.save(done);
            })

            before(function(done){
                session = new Session();
                session.session_id = session_id;
                session.setUser(user,function(){
                    session.save(done);
                })
            });

            it("should not index",function(done){
                get("/session")
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });

            it("should not create for wrong data",function(done){
                post("/session")
                    .send({nick: "wrong",pass:"wrong"})
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });


            it("should not edit",function(done){
                put("/session/"+ session._id)
                    .send({nick: "wrong",pass:"wrong"})
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });

            it("should not remove",function(done){
                del("/session/"+ session._id)
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });
            it("should not be accessible by /me without session created",function(done){
                get("/session/me"+ session._id)
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });
        });

        describe("actions when session set",function(){
            it("should create for existent user",function(){
                post("/session")
                    .send({nick: "wrong",pass:crypto.createHash()})
                    .end(function(res){
                        expect(res.body).to.be.ok;
                        res.status.should.be.eql(403);
                        done();
                    });
            });
            it("should not be accessible by /me with wrong cookie");
            it("should be accessible by /me with right cookie by create");
            it("should not be edited by /me");
            it("should be removed by /me");
        })
    });
});