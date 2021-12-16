const { urlencoded } = require('body-parser')
const express = require('express')

const Razorpay = require('razorpay')
const crypto = require('crypto')

const app = express()

const spawn = require('child_process').spawn

const razorpay = new Razorpay({
    key_id: "rzp_test_RB4XB3fA0t4jRO",
    key_secret: "jaJwSJJ0cJFi0z4WJza4AaOx"
})

app.set('views', 'views')
app.set('view engine', 'ejs')
app.use(urlencoded({extended: false}))

app.get('/', (req,res)=>{
    res.render('preview.ejs')
})

app.post('/order', (req,res)=>{
    const orderDetails = {
        amount: 50000,
        currency: 'INR',
        receipt: 'RC-123'
    }
    razorpay.orders.create(orderDetails, (err, order) => {
        if(err) res.send(err.message)
        console.log(order)
        res.send(order)
    })
})

app.post("/order-check", (req,res)=>{
    console.log(req.body)
    console.log("i am called")

    razorpay.payments.fetch(req.body.razorpay_payment_id).then((data) => {
        console.log(data)


        const shasum = crypto.createHmac("sha256", "jaJwSJJ0cJFi0z4WJza4AaOx");

        shasum.update(`${data.order_id}|${req.body.razorpay_payment_id}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== req.body.razorpay_signature)
            return res.send("Transaction not legit");

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
        razorpay.orders.fetch(data.order_id).then(data=>{
            console.log("order",data)
        })

        res.send(
            `success,
            ${data.order_id},
            paymentId: ${req.body.razorpay_payment_id}`);
        // if(data.status=='captured'){
        //     //check order status
        //     res.send("payment Done")
        // }
        // else{
        //     res.send("FAILED")
        // }
    })
    
})

app.post("/paymentFailed",(req,res)=>{
    console.log(req.body)
    res.send("error")
})

app.get("/process", async (req,res)=> {
    await spawn('python3',["script.py"])
    res.send("hello")
})


app.listen(3001, ()=>{
    console.log("started at 3000")
})