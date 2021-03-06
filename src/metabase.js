const request = require('postman-request')

require('dotenv').config()

const baseUrl = process.env.METABASE_BASE_URL
const username = process.env.METABASE_USERNAME
const password = process.env.METABASE_PASSWORD

const auth = (callback) => {
    const url = baseUrl + "/session"
    console.log("Authenticating",username)
    request({url, json:true, method:"POST", body: {username: username, password:password}}, (error, response) => {
        if (error) {
            callback(error, undefined)
        } else {
            token = response.body.id
            callback(undefined, response.body.id)
        }
    })
}

const update = (origin, destination, databaseId, callback) => {
    getQuestion(origin, (error, response) => {

        if (error) {
            callback(error, undefined)
            return 
        }
        
        const {visualization_settings, description, collection_position, result_metadata, dataset_query, display} = response.body
        dataset_query.database = databaseId
        const body = {
                visualization_settings,
                description,
                result_metadata,
                dataset_query,
                display
        }
        updateQuestion(destination, body, (error, response) => {
                if (error){
                     callback(error, undefined)
                     return
                }

                callback(undefined, response)
        })
    })
}

const updateQuestion = (id, body, callback) => {
    console.log("Updating question...")
    const url = baseUrl + "/card/" + id
    request({ url, json:true, headers: {"X-Metabase-Session": token}, method:"PUT", body}, (error, response) => {
        if (error){
            callback(error, undefined)
            return
       }

       callback(undefined, response)
    })
}

const duplicate = (questionId, collectionId, questionName, databaseId, callback) => {
    getQuestion(questionId, (error, response) => {

        if (error) {
            callback(error, undefined)
            return 
        }
        
        const {visualization_settings, description, collection_position, result_metadata, dataset_query, display} = response.body
        dataset_query.database = databaseId

        var name = questionName
        if (!name) {
            name = response.body.name
        }

        const body = {
                visualization_settings,
                description,
                collection_id: collectionId,
                collection_position,
                result_metadata,
                dataset_query,
                name,
                display
        }

        createQuestion(body, (error, response) => {
            if (error){
                callback(error, undefined)
                return
            }

            callback(undefined, response)
        })
    })
}

const createQuestion = (body, callback) => {
    console.log("Creating new question...")
    console.log(body)
    const url = baseUrl + "/card/"
    request({ url, json:true, headers: {"X-Metabase-Session": token}, method:"POST", body}, (error, response) => {
        if (error){
            callback(error, undefined)
            return
       }

       callback(undefined, response)
    })
}

const getQuestion = (id, callback) => {
    auth((error, token) => {
        if (error) {
            callback(error)
            return
        }

        console.log("Retrieving question id",id)

        const url = baseUrl + "/card/" + id
        request({url, json:true, headers:{"X-Metabase-Session": token}}, (error, response) => {
            if (error){
                callback(error, undefined)
                return
            }
    
            callback(undefined, response)
        })

    })
}



module.exports = {
    update: update,
    duplicate: duplicate
}