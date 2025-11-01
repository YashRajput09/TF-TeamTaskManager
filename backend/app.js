import express from "express";

const app = express();

const port = 3000;
app.listen(port, ()=>{
    console.log(`Listening on port: ${port}`);
});
app.use("/",(req, res)=>{
    res.send("Radhe Radhe");
})