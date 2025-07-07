# 📦 GFS-API

## Introduction
👋 This is a small REST API written in typescript for as an answer to the GFS technical test.

It accepts a data set in csv format, loads it into an in-memory data store and provides a simple mechanism to query data

## Getting Started
* Be running a recent(ish) node version (I was running `20.11.1`)
* clone the repo and cd into `gfs-api`
* install dependencies with `$ npm install`
* run the app `npx tsx src/main.ts -f <path/to/dataset> -p 3001`

## End Points
There are currently two endpoints:
* `/v1/consignments/<consignmentNumber>` consignment number can be any whole consignment number of part thereof 4 or more characters long.
Shorter strings will yield a `400`

* `/v1/consignments?address=searchString`. This was supposed to be the start of a query builder but time did not permit a fuller exploration.
 This also requires a search string 4 or more characters long.

you can optionally specify a `pageSize` and `pageSize` querystring parameter to control the result paging. If these are not specified they default to `10` and `1` respecrtively

### Example responses:

The response format is consistent across the end points (for now)

#### Found matching records
```json
{
	"total": 1,
	"count": 10,
	"pageNumber": 1,
	"pages": 1,
	"data": [
		{
			"consignmentNumber": "77476666446441",
			"deliveryAddress": "Flat 9\nJones lights, GU0 8NU",
			"weight": "36.61 lb",
			"deliveryType": "Domestic",
			"parcelCount": "27",
			"shipmentDate": "2025-04-18",
			"deliveryDate": "2025-04-21",
			"status": "Delivered"
		},
	]
}
```

#### No matching records

```json
{
	"total": 0,
	"count": 10,
	"pageNumber": 1,
	"pages": 0,
	"data": []
}
```

## Implementation Rationale

I have used `itty-router` for routing because it's quite small and has a nice api.

Data is loaded from a csv into a Hashmap (implemented as a map of `<string, consignment>` where string is the consignment number). This works in well enough in the demo environment but in more real-world environment this could be an in-memory store such as redis, sqlite or even an RDMS. Whatever store is used, when datasets get larger we'll have to think about indexing on fields we want to query on, efficient query design, etc. We could shard data sets, for example by courier or archive older records. We don't want to ETL our store every time our API starts up so this could be a separate service.

I've used the `csv-parse` package to extract data from a csv file, transform it into our storage shape, and then load it into our store. I have chosen not to hand-roll a parser both for time constraints but more importantly for the huge number of potential edge case it'll have to deal with.

I have included a `/health` endpoint that something like check.ly, it could check something like db access, response time, memory usage and return an appropriate HTTP code

## Thoughts, questions, and future development.

### Users
What is the intended use of the API?, Who/What will be calling the API?, How often will it be called?

I'm using a hashmap as an in-memorty store for convenience but in a real scenario we'd want a proper db, could be redis, cosmos, monogp etc.

### ETL (Extract Transform Load)
I decided to use a well tested and maintained parser, (`csv-parse` seemed reasonable) that could cope with bad input data.

We can also use this to transform our data into a more consistent storage shape as we extract and load it.

To guard against csv-injection attacks we don't automatically cast any of the input data to natibe types other than strings.

In a real world scenario we'd also want to normalise things like address formar.

Input shape is variable, use our ETL process process into a consistent storage shape

### Output Shape

Do we always want to return all fields/whole object or can this be specified in the request

Don't want to return internal IDs (not that we set any in this case)

For queries that return large payloads, consider alternative encodings (BSON, Avro)

### Query format

This could be an entire exercise by itself. How do we effectively query data, I've used querystring params as an example but how do we use multiple of these effectively (i.e i.e `&address=*, &status=*`), how do they combine and work together if multiple are specified (i.e do they `||` or `&&` together)

### Security
I looked a little at guarding against injection attacks in the csv parser but endpoints need protecting too. There's quite a bit to consider but briefly:

* Validate querystring params (format/length) and return early if erroneous; fields like post codes have patterns to match against but what about consignment numbers, these can probably vary wildly by courier
* Use token(JWT)-based auth (client/scope/claim/)
* Rate limiting
* limit max page size
* limit max number of results
* Allow/disallow origins
* Use prepared statement/stored proc for querying db

### Other thoughts and concerns
* Use ETags/Last-Modified header to aid with caching cacheing
* logging/observability

This list is far from comprehensive but hopefully includes some interesting points. It's offered as a starting point for a conversation about design constraints, requirements, etc.
