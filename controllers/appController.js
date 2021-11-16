const bcrypt = require("bcryptjs");
const store = require("../app");
const client = require("../middleware/initredis");
const User = require("../models/User");


exports.landing_page = (req, res) => {
  res.render("landing");
};

exports.login_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("login", { err: error });
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(email)

  if (!user) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  req.session.isAuth = true;
  req.session.userId = user._id;
  res.redirect("/dashboard/");
};

exports.register_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("register", { err: error });
};

exports.check=(req,res)=>{
  const error=req.session.error
  delete req.session.error;
  res.render("check",{err:error})
}

exports.checkemail=async(req,res)=>{
  const {email} = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    req.session.error = "email does not exists";
    return res.redirect("/check");
  }  
  res.redirect(`/forgetui/${user._id}`)

}

exports.forgetUI=(req,res)=>{
  const error=req.session.error  
  delete req.session.error;
  const {userId}=req.params
  res.render("forgetpassword",{err:error,userId:userId})

}
exports.forgetpassword=async(req,res)=>{
  const { password,userId } = req.body;
  const hasdPsw = await bcrypt.hash(password, 12);
  await User.updateOne({_id:userId},{$set:{
    password:hasdPsw
  }})
  console.log(req.sessionID,"iha aa gya",password,userId)

  
  res.redirect("/login");
  
}

//we need to make another function for password change after login we can do in abo ve also but sending user id will to fuzzy 
//after login we have session and where we abstract the userId 
exports.changepassUI=(req,res)=>{
  const error=req.session.error
  delete req.session.error;

  res.render("password",{err:error})

}

exports.changepassword=async(req,res)=>{
  const { password} = req.body;
  const hasdPsw = await bcrypt.hash(password, 12);
  console.log(req.session.userId)
  await User.updateOne({_id:req.session.userId},{$set:{
    password:hasdPsw
  }})
  const currentsession=client.get(req.sessionID)
  console.log("aa gya current ",currentsession )
  client.keys('*', function (err, keys) {
    if (err) return console.log(err);
    if(keys){
        keys.map((key)=>{
          client.get(key, function (error, value) {
            const  obj = JSON.parse(value)
            const currentkey=key.split(":")[1]
            console.log(currentkey, req.sessionID)
            if(obj.userId ==req.session.userId && currentkey!=req.sessionID)
            {
              
                client.del(key,function(err,reply){
                  console.log(err,reply)
                })
              
            }
            
            
        }); 

        })
    }
});
  
  res.redirect("/dashboard");

}



exports.register_post = async (req, res) => {
  const {  email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    req.session.error = "User already exists";
    return res.redirect("/register");
  }

  const hasdPsw = await bcrypt.hash(password, 12);

  user = new User({
     
    email,
    password: hasdPsw,
  });

  await user.save();
  res.redirect("/login");
};

exports.dashboard_get = (req, res) => {
  const username = req.session.username;
  res.render("dashboard", { name: username });
};

exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
};
