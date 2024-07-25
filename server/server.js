const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors())
app.options('*', cors())
// TODO implement the cors

var corsOptions = {
    origin: '*',
    // methods:['GET','PUT','OPTION'], // critical
    optionsSuccessStatus: 200 // 204 for some browsers is not permitted
}


//TODO add the maps response


app.get('/', cors(corsOptions),(req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

/**
 * @response MAPs format for lane intersection traffic light data
 */
app.get('/trafficlights/maps/:intersectionId', cors(corsOptions), (req, res)=>{
    try {
        const {intersectionId} = req.params;
        console.log("[server] REQUEST received for ", intersectionId)
        const mapsResponse = require(`./data/MAP_${intersectionId}.json`);
        res.send(mapsResponse);

    } catch (error) {
        res.status(404).send({ error: 'Data not found for id', intersectionId});
    }

})

//POST request

app.post('/', (req, res)=>{
    const {name} = req.body;

    res.send(`Welcome ${name}`);
})

app.listen(PORT, (error) =>{
        if(!error)
            console.log("Server is Successfully Running,and App is listening on port "+ PORT)
    else
        console.log("Error occurred, server can't start", error);
    }
);
