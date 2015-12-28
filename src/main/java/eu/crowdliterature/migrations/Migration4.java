package eu.crowdliterature.migrations;

import de.deepamehta.core.model.AssociationDefinitionModel;
import de.deepamehta.core.service.Migration;



/**
 * Adds "Place of birth", "Nationality" and "Language" to Person.
 * Runs ALWAYS.
 * <p>
 * Part of CROWD Literature 0.3
 */
public class Migration4 extends Migration {

    @Override
    public void run() {
        dms.getTopicType("dm4.contacts.person")
            .addAssocDefBefore(new AssociationDefinitionModel("dm4.core.aggregation_def", "crowd.person.place_of_birth",
                "dm4.contacts.person", "dm4.contacts.city", "dm4.core.many", "dm4.core.one"),
                "dm4.contacts.phone_number#dm4.contacts.phone_entry")
            .addAssocDefBefore(new AssociationDefinitionModel("dm4.core.aggregation_def",
                "dm4.contacts.person", "crowd.person.nationality", "dm4.core.many", "dm4.core.many"),
                "dm4.contacts.phone_number#dm4.contacts.phone_entry")
            .addAssocDefBefore(new AssociationDefinitionModel("dm4.core.aggregation_def",
                "dm4.contacts.person", "crowd.language", "dm4.core.many", "dm4.core.many"),
                "dm4.contacts.phone_number#dm4.contacts.phone_entry");
    }
}
