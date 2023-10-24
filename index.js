import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import dotenv from 'dotenv';
const app = express();

dotenv.config();
app.use(bodyParser.json({limit: "30mb", extended:true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended:true}))
app.use(cors());

app.get('/', (req, res)=>{
    res.status(200).json({"success": true});
});

// app.get('/sendEmail', (req, res)=>{
//     sendEmail("arunachalamraj06@gmail.com", "checking", "Checking");
//     res.status(200).send({message: "Message sent"})
// })

app.use('/posts', postRoutes);
app.use('/users', userRoutes);

const CONNECTION = process.env.DB_STRING

const PORT = process.env.PORT || 5000;
mongoose.connect(CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>app.listen(PORT, ()=> console.log(`server running on ${PORT}`)))
.catch((error)=>{console.log(error.message)})

// mongoose.set('useFindAndModify', false);