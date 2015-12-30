package eu.crowdliterature;

import eu.crowdliterature.model.Person;
import eu.crowdliterature.model.PersonOfWork;
import eu.crowdliterature.model.Translation;
import eu.crowdliterature.model.Work;
import eu.crowdliterature.model.WorkOfPerson;

import de.deepamehta.core.ChildTopics;
import de.deepamehta.core.RelatedTopic;
import de.deepamehta.core.Topic;
import de.deepamehta.core.osgi.PluginActivator;
import de.deepamehta.core.service.ResultList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import java.util.ArrayList;
import java.util.List;



@Path("/crowd")
@Produces("application/json")
public class CrowdPlugin extends PluginActivator implements CrowdService {

    // -------------------------------------------------------------------------------------------------- Public Methods



    // ***********************************
    // *** CrowdService Implementation ***
    // ***********************************



    // --- Person ---

    @GET
    @Path("/person/{id}")
    @Override
    public Person getPerson(@PathParam("id") long personId) {
        Topic person = dms.getTopic(personId);
        ChildTopics childs = person.getChildTopics();
        return new Person(
            person.getSimpleValue().toString(),
            childs.getChildTopics("dm4.datetime.date#dm4.contacts.date_of_birth").getStringOrNull("dm4.datetime.year"),
            childs.getStringOrNull("dm4.contacts.city#crowd.person.place_of_birth"),
            childs.getString("dm4.contacts.notes"),
            values(person, "dm4.webbrowser.url"),
            values(person, "crowd.person.nationality"),
            values(person, "crowd.language")
        );
        // ### TODO: institutions, works, events
    }

    // --- Works ---

    @GET
    @Path("/work/{id}")
    @Override
    public Work getWork(@PathParam("id") long workId) {
        Topic work = dms.getTopic(workId);
        ChildTopics childs = work.getChildTopics();
        return new Work(
            work.getSimpleValue().toString(),
            childs.getStringOrNull("crowd.work.type"),
            childs.getStringOrNull("crowd.language"),
            childs.getStringOrNull("dm4.datetime.year#crowd.work.year_of_publication"),
            childs.getStringOrNull("dm4.contacts.city#crowd.work.place_of_publication"),
            values(work, "crowd.work.genre"),
            childs.getString("crowd.work.notes"),
            childs.getStringOrNull("crowd.work.isbn"),
            childs.getStringOrNull("dm4.webbrowser.url"),
            translations(work),
            getPersonsOfWork(workId)
        );
    }

    @GET
    @Path("/person/{id}/works")
    @Override
    public List<WorkOfPerson> getWorks(@PathParam("id") long personId) {
        List<WorkOfPerson> works = new ArrayList();
        Topic person = dms.getTopic(personId);
        // works
        for (RelatedTopic work : person.getRelatedTopics("crowd.work.involvement", "dm4.core.default",
                                                         "dm4.core.default", "crowd.work")) {
            String workTitle = work.getSimpleValue().toString();
            String role = work.getRelatingAssociation().getSimpleValue().toString();
            works.add(new WorkOfPerson(work.getId(), workTitle, role));
        }
        // translations
        for (RelatedTopic translation : person.getRelatedTopics("crowd.work.involvement", "dm4.core.default",
                                                                "dm4.core.default", "crowd.work.translation")) {
            Topic work = getWorkOfTranslation(translation.getId());
            String workTitle = work.getSimpleValue().toString();
            String role = translation.getRelatingAssociation().getSimpleValue().toString();
            works.add(new WorkOfPerson(work.getId(), workTitle, role));
        }
        //
        return works;
    }

    // --- Event Series ---

    @GET
    @Path("/event/{id}/event_series")
    @Override
    public ResultList<RelatedTopic> getEventSeriesOfEvent(@PathParam("id") long eventId) {
        return dms.getTopic(eventId).getRelatedTopics("dm4.core.association", "dm4.core.default", "dm4.core.default",
            "crowd.event_series");
    }

    @GET
    @Path("/event_series/{id}/events")
    @Override
    public ResultList<RelatedTopic> getEventsOfEventSeries(@PathParam("id") long eventSeriesId) {
        return dms.getTopic(eventSeriesId).getRelatedTopics("dm4.core.association", "dm4.core.default",
            "dm4.core.default", "dm4.events.event");
    }



    // ------------------------------------------------------------------------------------------------- Private Methods

    /**
     * @param   workId      ID of a work or a translation
     */
    private List<PersonOfWork> getPersonsOfWork(long workId) {
        List<PersonOfWork> persons = new ArrayList();
        for (RelatedTopic person : dms.getTopic(workId).getRelatedTopics("crowd.work.involvement", "dm4.core.default",
                                                                         "dm4.core.default", "dm4.contacts.person")) {
            persons.add(new PersonOfWork(
                person.getId(),
                person.getSimpleValue().toString(),
                person.getRelatingAssociation().getSimpleValue().toString()
            ));
        }
        return persons;
    }

    private Topic getWorkOfTranslation(long translationId) {
        return dms.getTopic(translationId).getRelatedTopic("dm4.core.composition", "dm4.core.child", "dm4.core.parent",
            "crowd.work");
    }

    // ---

    private List<Translation> translations(Topic work) {
        List<Translation> translations = new ArrayList();
        for (Topic translation : work.getChildTopics().getTopics("crowd.work.translation")) {
            ChildTopics childs = translation.getChildTopics();
            translations.add(new Translation(
                childs.getStringOrNull("crowd.work.title"),
                childs.getStringOrNull("crowd.language"),
                childs.getStringOrNull("crowd.work.isbn"),
                getPersonsOfWork(translation.getId())
            ));
        }
        return translations;
    }

    private List<String> values(Topic topic, String assocDefUri) {
        List<String> values = new ArrayList();
        List<RelatedTopic> topics = topic.getChildTopics().getTopicsOrNull(assocDefUri);
        if (topics != null) {
            for (Topic t : topics) {
                values.add(t.getSimpleValue().toString());
            }
        }
        return values;
    }
}
