import axios from 'axios'
import express from 'express'
const app = express()
import cors from 'cors'
app.use(express.json())
app.use(cors())
let  pID = {}
let pSAVED = {}
const port = 3000


function procesar (req) {
    return Object.assign({}, req.body, req.params, req.query)
}

app.get('/getAll', function(req, res) {
    res.send(pSAVED)
})

app.post('/create', function(req, res) {
    let params = procesar(req)
    let attributes = {}
    let name = params.name
    attributes.id = params.id
    attributes.weight = params.weight
    attributes.height = params.height
    attributes.base_experience = params.base_experience
    attributes.types = params.types
    pID[attributes.id] = name
    pSAVED[name] = attributes
})


app.get('/get/:id', function(req, res) {
    let pName =  pID[req.param('id')]
    attributes = pSAVED[pName]
    res.send(pName, attributes)
})

app.get('/delete/:id', function(req, res) {
    let id = req.param('id')
    let pName =  pID[id]
    delete  pID[id]
    delete pSAVED[pName]
  })




app.put('/update/:id', function(req, res) {
  let params = procesar(req)
  let attributes = {}
  attributes.id = req.param('id')
  attributes.weight = params.weight
  attributes.height = params.height
  attributes.base_experience = params.base_experience
  attributes.types = params.types
  let name =  pID[attributes.id]
  pSAVED[name] = attributes
})



app.get('/pokemon', function(req, res) {
    let params = procesar(req)
    let pName = params.name
    if(pSAVED.hasOwnProperty(pName)) {
        let attributes = pSAVED[pName]
        res.send({is_error: false, attributes})
        return;
    }
    axios.get('https://pokeapi.co/api/v2/pokemon/')
        .then((response) => {
          let pokemons  = response.data.results;
          let pokemon = pokemons.find(element => element.name === pName)
          if(pokemon === undefined){
            res.send({is_error: true, message: "error"})
            return;
          }
          else{
            axios.get(pokemon.url)
              .then((response) => {
                  let attributes = response.data
                  pSAVED[pName] = attributes
                  pID[attributes.id] = pName
                  res.send({is_error: false, attributes})
                  return;
              })
              .catch(error => {
                  let message = error.toString()
                res.send({is_error: true, message})
                return;
              })
          }
        })
        .catch(error => {
            let message = error.toString()
            res.send({is_error: true, message})
            return;
        })
})

app.listen(port)