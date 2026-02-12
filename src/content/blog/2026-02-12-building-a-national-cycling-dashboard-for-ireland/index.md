# Building a National Cycling Dashboard for Ireland

A couple of years ago, I asked Ireland's National Transport Authority (the NTA) what the national approach to measuring active travel was. The answer wasn't ideal: there is no national appoach (and in 2026 this is still the case, as far as I know). There is only a Dublin-based group who measure active travel in Dublin - using a vast number of sensors, and a team of people. Outside of Dublin, the picture is less than inspiring.

This isn't very surprising, as the NTA have historically been focused on Dublin, rather than being a truly national organisation. This is changing, but in the meantime, I had to find a way to get data for the whole country. I've been aware of Telraam for a few years, since the "version 1"  citizen science project, which was pretty succesful in terms of the number of sensors deployed. I'm sharing my experiences building a national dashboard, in the hope that the community can suggest ways to work around some challenges I found, and to encourage the Telraam team to improve their API and data quality.

My first challenge was how to identify all the sensors in Ireland. I looked to the API documentation and found more than one answer - both of which required me to do goespacial calculations. There appears to be no API call to get all sensors on the island of Ireland.

## Sensors - Cameras or Segments?

Where to start? Looking at the API docs, there are a few options
* All Segments? 
* All available cameras? 
* Active segments [legacy version]? 

## All Segments?

API: https://telraam-api.net/v1/segments/all 

The description says "This HTTP GET request method is used to retrieve all road segments from the server in GeoJSON format (coordinate pair strings). ... Also, the returned coordinates are in EPSG 31370 format. We suggest using one of the traffic snapshot APIs instead, which return the more commonly used EPSG 4326 format (and other useful data)." 

Hmm. OK. What?

### Recommendation: 
1. Update the description to clarify whether the response uses GeoJSON or EPSG 31370 (or both). 
2. Why provide this API and then suggest using "one of" the traffic APIs? Either fix this API to provide clear results, or deprecate it and specify which API exactly should be used instead
3. Explain the response structure, including what is an oidn (OIDN?)

## All Available Cameras?

Firstly, why include the word "available"? This implies the existence of unavailable cameras - perhaps if they've temporarily stopped sending data? How do I find those? Is a camera the same thing as a sensor?

API: https://telraam-api.net/v1/cameras

The description explains that this API "is meant to retrieve all available camera instances from the server". Now we can see that a camera (sensor) may have been moved from one location (segment) to another, which is useful to understand. This API very helpfully provides a description for the response data. Great job :)

### Recommendation:
4. The API documentation clarifies that even inactive cameras can be returned, so shouldn't this API be "All Cameras"?
5. It would be useful to allow parameters to be passed to the API to filter the data returned, rather than sending all cameras


## All Sensors in Ireland?

I looked at the live traffic API and noticed that the timezone was included. Aha! This means I could simply filter by "Europe/Ireland" right?
Wrong. Some of the sensors located in Ireland were configured in the UK or elsewhere.

In the end I used the "all segments" API to fetch a list of ALL segments, and then filtered them according to their distance from Athlone, before manually removing a new sensors. Oh, and each segment is an area not a point, so you have to do a bit more post-processing - you don't see get the point location of the camera (which makes sense, for privacy reasons)

Finally, I grabbed the GeoJSON boundary files for each County in Ireland, and identified which county each sensor was in.

### Recommendation
6. Allow a parameter to be provided to limit the API response to a region - either by a country identifier, or a GeoJSON bounding box
7. It would also be useful to filter the list by other parameters - status, and date of last package for example

Pulling Information about the Sensor

Next I wanted to display all the sensors, and the total bikes for the last 24 hours. Each sensor has an ID. But when you look at the sensor on Telraam.net you also see a nice description - usually the location.

API: I couldn't find this description field in any API
### Recommendation
8. Include sensor_description in the API response for "cameras by segment id"

Since the description wasn't in the API, I scraped the sensor page on Telraam.net - the information is available in the `headerpic-text-block` in case you're wondering.

To recap, here's what I had so far:
- ✅ The list of all sensors in Ireland
- ✅ The county for each sensor
- ✅ The human-readable description for each sensor

Now it's time to fetch the actual data from each sensor

## Pulling Sensor Data

First I decided to fetch the totals for each day, so that I could show the total for Ireland, and subtotal for each County.
This meant looping through the list of sensors, and calling the API for each in turn: https://telraam-api.net/v1/reports/traffic

With a limit of 1,000 API calls per day, and wanting to be respectful of the Telraam infrastructure, I rate limited the requests to one per second.
Whether it was due to repeated testing or something else, I hit the rate limit, so backed off to 1 request every 5 seconds. This worked fine. Until I hit a limit of 30 seconds on my worker job, and had to split the requests into batches. Perhaps I should have simply grabbed ALL data, but that didn't seem right to me.

### Recommendation
9. Provide rate-limiting information in the response headers, so that scripts can back-off dynamically, rather than using static delays
10. The API only allows a "format" of hourly data. It would be nice to be able to specify aggregated data, by day, week or month in the API request.
Now that I was fetching data, I found that some sensors were inactive. Some years ago there was an initiative to roll out the Telraam v1 sensors, and many of these are now switched off. 

## Strange Data

Now that I have the hourly data, I found a couple of strange situations
* The hourly data also included detailed car-speed histogram data
* Some sensors were reporting data that was just plain wierd!

### Recommendations
11. Provide a separate API, or parameter for the API, if you're interested in car speed histogram data

The wierd data was a fun challenge. Some sensors were reporting more bikes than cars. WAY more bikes than cars! Wow, cycling must be really popular in these locations, right?

Well, no. Some of the sensors were located in pedestrian areas. The Telraam is designed to look at a road at a 90 degree angle, not at a pedestrian plaza. Understandably, the data coming from the sensor wasn't reasonable. On the less extreme scale, other sensors appear to be set up correctly on a regular street, but appeared to be over-reporting bikes significantly.

As luck would have it, I knew someone in the active travel team at one of these locations, and they confirmed that the sensor was known to be reporting weird amounts, but they had moved on to another project. So the sensor remained, dutifully emitting strange data.

Still other sensors reported suspiciously-high bike counts. Unfortunately there's no way to contact the sensor owners, and no way to resolve this - unless the community has a solution?

I implemented a "quarantine" flag in my system, so that the suspicious data wouldn't be counted in daily totals, but the sensor can still be found. It's not an ideal solution, and again perhaps the community had thoughts about handling this.

## Conclusion

Overall this has been quite a fun project, and a great exercise in understanding the reality of traffic sensor data. I'd love to see improvements to the API - and I'd be happy to provide a PR or more detailed feedback if that would be helpful. I'd also like to hear from the community about any aspect of this, but in particular how to detect and handle "suspicious" data.

You can see the results of this project at [TheRide.ie](https://www.theride.ie)

And you should definitely ask your friends in Ireland if they've got the ride recently :P