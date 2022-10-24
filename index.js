const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const URI = 'mongodb+srv://bbnerino:bb27655100@cluster0.mvpaa.mongodb.net/?retryWrites=true&w=majority'
mongoose
.connect(URI)
.then(() => console.log('MongoDB Connected...'))
.catch((e) => console.log('MongoDB error: ', e));

app.listen(port, () => {
  console.log(` 로컬호스트 ${port}`)
})