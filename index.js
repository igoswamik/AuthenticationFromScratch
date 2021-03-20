const express=require('express');
const app=express();
const User=require('./models/user');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt'); 
const user = require('./models/user');
const session=require('express-session');

mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo CONNECTION OPEN!!!")
    })
    .catch((err) => {
        console.log("OH NO Mongo Connection ERROR!!!!")
        console.log(err)
    })


app.set('view engine','ejs');
app.set('views','views');

app.use(express.urlencoded({extended:true}));
app.use(session({secret:'notagoodsecret'}));

const requireLogin=(req,res,next)=>{
    if(!req.session.user_id){
        res.redirect('/login');
    }
    next();
}
app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/register',(req,res)=>{
    res.render('register');
})
app.post('/register',async(req,res)=>{
    const {username,password}=req.body;
    // const hash=await bcrypt.hash(password,12); //instead of this I used usershcema.pre middleware to hash password before save
    const user=new User({username,password})
    await user.save();
    req.session.user_id=user._id;
    res.redirect('/');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/login',async(req,res)=>{
    const {username,password}=req.body;
        // const user=await User.findOne({username}); //username is unique
        // const validPassword=await bcrypt.compare(password,user.password);
    const foundUser=await User.findAndValidate(username,password);  //middleware setup inside user model
    if(foundUser){
        req.session.user_id=foundUser._id; //if we successfully logged in we store user_id in session
        res.redirect('/secret');
    }else{
        res.redirect('/login');   
     }
})

app.post('/logout',(req,res)=>{
    req.session.user_id=null;
    req.session.destroy();
    res.redirect('/login');
})
app.get('/secret',requireLogin,(req,res)=>{
    // if(!req.session.user_id){
    //     res.redirect('/login');
    // }
    //did this throught middleware -requireLogin
    res.render('secret');
})
app.get('/topsecret',requireLogin,(req,res)=>{
    res.render('secret');
})
app.listen(3000,()=>{
    console.log("Serving your app on port 3000");
})