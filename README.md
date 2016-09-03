
CROWD Literature - Omnibus Reading Tour 2016
============================================

A geographical event calendar with author profiles for the Omnibus Reading Tour.  
A DeepaMehta 4 plugin.  
Content authoring is done via the DeepaMehta Webclient.

Public installation:  
<http://crowdlitbus.eu/>

About the Omnibus Reading Tour:  
<http://crowd-literature.eu/omnibus-2/>

DeepaMehta 4 is a platform for collaboration and knowledge management:  
<https://github.com/jri/deepamehta>


Running locally
---------------

After installation go to:  
<http://localhost:8080/eu.crowd-literature/>


Development
-----------

For a save-reload turnaround start the frontend directly from the DeepaMehta file repository:

    http://localhost:8080/filerepo/dm4-crowd-literature/src/main/resources/web/

Now, when you edit any client-side resource (Javascript, HTML, CSS, ...) save it and press reload in the browser.
Your changes will appear immediately. No building required.

3 requirements for this to work:

* The `jri/dm4-crowd-literature` git repo is cloned inside DM's `modules-external` directory.

* In DM's `pom.xml` the file repo is configured this way:

    `<dm4.filerepo.path>${project.basedir}/modules-external</dm4.filerepo.path>`

* In CROWD's `src/main/resources/web/index.html` comment this line:

    `<base href="/eu.crowd-literature/">`


Version History
---------------

**0.6.3** -- Sep 3, 2016

* Fixes:
    * Render detail pages with undefined event lists
* Depends on DeepaMehta 4.8.3

**0.6.2** -- Sep 1, 2016

* Depends on DeepaMehta 4.8.3

**0.6.1** -- Aug 31, 2016

* Map:
    * All-english names
    * Tour course updated
    * Optional initial center/zoom state for 2nd tour half
* Depends on DeepaMehta 4.8

**0.6** -- May 19, 2016

Public launch

* Map:
    * English country names
    * Real bustour line string
    * Markers/clusters of events over are gray
    * Selected event marker is orange
    * Zoom with mouse wheel
* Start page content is user editable
* Site header for main navigation
* Info pages:
    * Event lists are sorted by From date/time
    * Captioned images have no margin
    * Event page: show Participants before Notes
* "powered by DeepaMehta" attribution
* Fixes:
    * No double vertical scrollbars
    * Fix hires (>=144dpi) display detection
    * Works behind a reverse proxy
* Depends on DeepaMehta 4.8

**0.5** -- Mar 21, 2016

Webapp usability

* Web design by Zlata Pasalic
* Marker cluster rendering (by the help of Leaflet MarkerCluster plugin)
* Auto-scale images and videos
* Info pages:
    * Institution page: show events
    * Event page: show address along with institution link
    * Proper date/time formatting on all pages
    * New start page with CROWD logo and introduction text
* Mobile devices: on hi-res displays markers and clusters are slightly enlarged
* Spinning load indicator
* Fixes:
    * External links are working also if `http://` was not entered
    * No map "flickering through" on page change when in portrait mode
* Technical: the webapp talks solely to its own `/crowd` endpoint; does not rely on `/core` anymore
* Depends on DeepaMehta 4.8-SNAPSHOT

**0.4** -- Jan 19, 2016

First production version, updatable

* Work Involvement associations are typed automatically
* Info pages:
    * Work page: show institutions (publishers)
    * Event Series page: show events with dates
* Own public "CROWD" workspace
* Technical: uses DTOs for less requests and smaller transfer sizes
* Depends on DeepaMehta 4.8-SNAPSHOT

**0.3** -- Dec 30, 2015

Data model consolidation

* Views: Work details page, Institution details page, Event Series details page
* Data model:
    * Person has "Gender", "Place of birth", "Nationality" (multi), and "Language" (multi)
    * Work has "Year of publication" and "Place of publication"
    * Work "Genre" is a multi field
    * Event has "Entrance Fee"
    * "Event Series" is new topic type
    * "Curator" is new work involvement role
* Own REST service
* Depends on DeepaMehta 4.8-SNAPSHOT

**0.2** -- Dec 21, 2015

Technical basis

* Responsive web design: individual layouts for portrait/landscape orientation
* GeoJSON visualization of the bustour
* Clickable Event markers
* Event details page, Person details page, linked to each other
* Deep links
* Functional browser back/forward buttons
* Technical: Makes use of Angular-Leaflet directive
* Depends on DeepaMehta 4.8-SNAPSHOT

**0.1** -- Dec 15, 2015

Project setup

* Data model: Work, Translation, Work Involvement
* Leaflet based map rendering with Mapbox imagery
* Depends on DeepaMehta 4.8-SNAPSHOT


------------
Jörg Richter  
Sep 3, 2016
