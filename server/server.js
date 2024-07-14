const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors())
app.options('*', cors())
// TODO implement the cors

var corsOptions = {
    origin: 'http://localhost:8081',
    methods:['GET'], // critical
    optionsSuccessStatus: 200 // 204 for somebrowser is not permitted
}


//TODO add the maps response


app.get('/', cors(corsOptions),(req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

//POST request

app.post('/', (req, res)=>{
    const {name} = req.body;

    res.send(`Welcome ${name}`);
})

app.get('/trafficlights/maps/:intersectionId', cors(corsOptions), (req, res)=>{
    const {intersectionId} = req.params;
    try {
        const mapsResponse = require(`./data/MAP_${intersectionId}.json`);
        res.send(mapsResponse);
    } catch (error) {
        res.status(404).send({ error: 'Data not found' });
    }

})






app.listen(PORT, (error) =>{
        if(!error)
            console.log("Server is Successfully Running,and App is listening on port "+ PORT)
    else
        console.log("Error occurred, server can't start", error);
    }
);
