const io = require("socket.io-client");
const socket = io("http://localhost:5000");
const nodemailer = require('nodemailer');
const { default: axios } = require('axios');

socket.on("connect", () => {
	console.log(socket.connected); // true
});

const mailList = 
[
	"{list of users to mail too}"
]

const productQuerryList = [
	// "https://api.bestbuy.com/v1/products((search=g305))?apiKey=uzRVwWVLmGW7td4eMGEDWw92&format=json",
	"https://api.bestbuy.com/v1/products((search=RTX&search=3060)&salePrice<400&salePrice>300)?apiKey=uzRVwWVLmGW7td4eMGEDWw92&facet=salePrice&format=json", 
	"https://api.bestbuy.com/v1/products((search=GTX&search=1660)&salePrice<300&salePrice>200)?apiKey=uzRVwWVLmGW7td4eMGEDWw92&facet=salePrice&format=json" 
]
const transport = {
	service: "gmail",
	
	auth: {
		user:"amadeusstephenemailbot@gmail.com",
		pass:"$emailbot11"
	}
}
const transporter = nodemailer.createTransport(transport)


transporter.verify((error) => {
	if(error) {
		console.log(error)
	} else {
		console.log('Server is ready to take emails')
	}
})


async function buyProduct(productLink)
{   
	console.log("buyNow")
	socket.emit("link", {link:productLink } )
	

}

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  } 

async function sendEmail(productLink)
{
	mailList.forEach(email => {

		let mail = {
			from : "Robel Schwarz",
			to : email,
			subject: 'A Gpu on bestbuy.com just got in stock',
			text: productLink,
		}
		transporter.sendMail(mail, (err, data) => {
			if(err) {
				console.log(err)
				res.json({
					status:'fail'
				})
			} else {
				res.json({status:'success'})
				// console.log(data)
			}
		})

	})
}

async function run()
{
	let noStock = true
	while (noStock == true)
	{
		try
		{
			for (let productQuerry = 0 ; productQuerry < productQuerryList.length ; productQuerry+= 1 )
			{
				let reqData = await (await axios.get(productQuerryList[productQuerry])).data
				for (let product = 0 ; product < reqData.products.length; product += 1)
				{
					// console.log(reqData.products[product].orderable)
					if (reqData.products[product].orderable == "Available")
					{
						sendEmail(reqData.products[product].addToCartUrl)
						buyProduct(reqData.products[product].addToCartUrl)
						noStock = false
						break
					}
				}
				await sleep(5000)

			}
		} catch(err)
		{
			console.log(err)
		}
	} 

}
run()