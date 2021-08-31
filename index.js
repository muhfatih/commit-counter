const express = require("express")
const axios = require("axios")
const app = express()

app.listen(5000);


app.get("/:username", async (req,res) => {
	const {username} = req.params
	const {token} = req.query
	const axclient = axios.create({
		headers:{
			Authorization: `bearer ${token}`
		}
	})
	const createdate = await axclient.post('https://api.github.com/graphql', {
		query: `{
			user(login: "${username}") {
				createdAt
			}
		  }`
		
	})
	.then((res) => res.data)
	.then((data) => data.data.user.createdAt)
	.catch(err => {
		console.log(err);
	})
	if(!createdate) return res.status(400).json("Invalid username")
	console.log(createdate);
	const CreateDate = new Date(createdate)
	const present = new Date()
	const arrayresult = []
	while(CreateDate<present){
		console.log(CreateDate);
		const datestart = new Date(CreateDate)
		const dateend = new Date(CreateDate.setFullYear(CreateDate.getFullYear() + 1))
		console.log(datestart.toISOString(), dateend.toISOString());
		const queries =  `{
			user(login: "${username}") {
			  contributionsCollection(from: "${datestart.toISOString()}", to: "${dateend.toISOString()}") {
				contributionCalendar {
				  totalContributions
				}
			  }
			}
		  }`
		console.log(queries);
		const result = await axclient.post('https://api.github.com/graphql', {
			query: queries
		})
		.then((res) => {
			console.log(res.data);
			return res.data.data.user.contributionsCollection.contributionCalendar.totalContributions
		})
		arrayresult.push(result)
	}
	console.log(arrayresult);
	const total = arrayresult.reduce((a,c) => a+c)
	console.log(total);

	return res.json(total)
})

