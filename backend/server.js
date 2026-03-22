const express = require ('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, "../frontend")));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
})
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});