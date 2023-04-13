// ganzes zeug in den getAllTours zb in eigene Classe machen
class APIFeatures {

    // query Muungo / Mongo, queryString --> (req.query) from express, basicly comming from the route
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    //1a) FILTERING...
    filter() {
        // 1a) FILTERING
        // um abzusichern... //http://127.0.0.1:4301/api/v1/tours?difficulty=easy&page=2   das hat es nicht, desshalb muss abgesichert werden
        const queryObj = {...this.queryString }; //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy
        //console.log("queryObj: " + queryObj)
        const excludedFields = ['page', 'sort', 'limit', 'fields'] // das will man nicht in der query,
        excludedFields.forEach(el => delete queryObj[el])
            //console.log("req.query und queryObj: " + req.query, queryObj) //http://127.0.0.1:4301/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10
            //console.log("req.query: " + req.query) //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy
            //const tours = await Tour.find() //findet alle documents inder tour, wenn es leer ist

        //erste variante suchen //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy
        // const tours = await Tour.find({ // oder in find({}) mit filter
        //     duration: 5,
        //     difficulty: 'easy'
        // })

        //zweite variante
        //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy') // anstatt .equalt .lt

        //const tours = await Tour.find(req.query)
        //const tours = await Tour.find(queryObj)// erst soll query obj alles in db finden, dann tours, darum query, dann await tours

        console.log('---------------')
            // 1b) advanced FILTERING
        let queryStr = JSON.stringify(queryObj) // muss let sein nicht const
            //console.log("queryStr: " + queryStr)
            // dollarzeichen rein machen
            // gte, gt, lte, lt
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // \b nur das wort, nicht wenn im wort vorkommt, /b multible time
            //console.log("JSON.parse(queryStr): " + JSON.parse(queryStr))
            // console.log("queryStr: " + queryStr) // in der dok sollte alle urls dokumentiert sein, und was man in der url suchen kann

        //let query = Tour.find(JSON.parse(queryStr)) //http://127.0.0.1:4301/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }


    // 2) SORTING      obwohl oben das man das nicht will
    //http://127.0.0.1:4301/api/v1/tours?sort=price     sortiert klein nach gross
    //http://127.0.0.1:4301/api/v1/tours?sort=-price    sortiert gross nach klein
    sort() { //{{URL}}api/v1/tours?sort=duration&sort=price gibt fehler, weil zweimal sort drin ist

        if (this.queryString.sort) { //(req.query.sort) {
            console.log(this.queryString.sort) //GET /api/v1/tours?sort=duration&sort=price 500 119.894 ms - 1106 fehler, weil array, aray kann nicht splitten, dafür middleware, wo datenverschmutzung weg macht, wahrscheinlich in app.js
            const sortBy = this.queryString.sort.split(',').join(' ') // komma mit leertaste ersetzen
                //console.log("sortBy: " + sortBy)
            this.query = this.query.sort(sortBy)
                //query = query.sort(req.query.sort)
                // sort('price ratingsAverage')
                //http://127.0.0.1:4301/api/v1/tours?sort=-price,ratingsAverage     preis und age sortiert
                // muss komma durch leertaste ersetzt werden
        } else { // wenn user nicht in url spezifisch sortiert, ein default wert
            this.query = this.query.sort('-createdAt') //http://127.0.0.1:4301/api/v1/tours
        }

        return this;
    }

    //3) FILD limiting  sollen alle Daten zurück kommen, oder nur teil davon
    //http://127.0.0.1:4301/api/v1/tours?fields=name,duration,difficulty,price    
    limitFields() {
        if (this.queryString.fields) { //(req.query.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            //query = query.select('name duration difficulty price')// nennt mann projecting
            this.query = this.query.select(fields) //http://127.0.0.1:4301/api/v1/tours?fields=name,duration,difficulty,price
        } else {
            this.query = this.query.select('__v') // macht mongose immer automatisch bei jedem object
            this.query = this.query.select('-__v') // damit nicht gesendet wird nicht not including, excluding // _id kann nicht...
                //passwort sollte zum beispiel nicht sehen
        } //http://127.0.0.1:4301/api/v1/tours?fields=-name,-duration
        // dann sieht mann alles, nur nicht name und duration

        return this;
    }


    paginate() {
        //4) PAGINATION paginierung nur 10 sachen auf einer seite anstatt 1000...
        //http://127.0.0.1:4301/api/v1/tours?page=2&limit=10
        // 1-10 -> page 1, 11-20 --> page 2   21-30 --> page 3
        //page=3&limit=10
        //query = query.skip(20).limit(10)
        // wenn user get allTours anfordert, bekommt nicht 1 million sonder erste hundert...
        const page = this.queryString.page * 1 || 1 // macht ne nummer draus // by default 1
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit // page 30 --> 21-30 --> 2* 10 -1

        //query = query.skip(10).limit(10)
        this.query = this.query.skip(skip).limit(limit) //http://127.0.0.1:4301/api/v1/tours?page=1&limit=3

        // das braucht es hier nicht, wäre, wenn keine daten mehr, dann error, aber es braucht es nicht, weil es dem user reicht wenn nichts kommt, braucht kein fehler auszugeben
        //http://127.0.0.1:4301/api/v1/tours?page=4&limit=3   gibt nur neun objekte, darum hier fehler
        // if (this.queryString.page) {
        //     const numTours = await Tour.countDocuments(); //zählt alle objekte von tout schema
        //     if (skip >= numTours) throw new Error('This page does not exist, weill nicht so viele Objekte in db')
        // }

        return this;
    }
}


module.exports = APIFeatures