/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { useEffect, useState } from "react";
import {Amplify, Auth } from "aws-amplify";
import { GetDatabaseCommand, GlueClient } from "@aws-sdk/client-glue";
import { Badge, ColumnLayout, Container, Header, SpaceBetween } from "@cloudscape-design/components";
import ValueWithLabel from "./ValueWithLabel";
import ResourceLFTagsComponent from "./TBAC/ResourceLFTagsComponent";
import DataDomain from "../Backend/DataDomain"

const config = Amplify.configure();

function DatabaseDetailsComponent({dbName, accessModeCallback, ownerCallback}) {
    const [db, setDb] = useState();

    useEffect(() => {
        async function run() {
            const credentials = await Auth.currentCredentials();
            const glueClient = new GlueClient({region: config.aws_project_region, credentials: Auth.essentialCredentials(credentials)});
            const db = await glueClient.send(new GetDatabaseCommand({Name: dbName}));
            setDb(db.Database);
            const parameters = db.Database.Parameters

            if (accessModeCallback) {
                accessModeCallback((parameters && "access_mode" in parameters) ? parameters.access_mode : "nrac")
            }

            if (ownerCallback) {
                const isOwner = await DataDomain.isOwner(parameters.data_owner)
                ownerCallback(isOwner)
            }
        }

        run()
    }, []);

    if (db) {
        return (
            <Container header={<Header variant="h2">Data Domain Details</Header>}>
                <ColumnLayout columns={2} variant="text-grid">
                    <SpaceBetween size="m">
                        <ValueWithLabel label="Data Domain Database Name">
                            {dbName}
                        </ValueWithLabel>
                        <ValueWithLabel label="Location">
                            {db.LocationUri}
                        </ValueWithLabel>
                        <ValueWithLabel label="Has PII">
                            {(db.Parameters && "pii_flag" in db.Parameters && db.Parameters.pii_flag === "true") ? <Badge color="red">Yes</Badge> : <Badge color="green">No</Badge>}
                        </ValueWithLabel>
                        <ValueWithLabel label="Access Mode">
                            {(db.Parameters && "access_mode" in db.Parameters) ? db.Parameters.access_mode : "n/a"}
                        </ValueWithLabel>
                    </SpaceBetween>
                    <SpaceBetween size="m">
                        <ValueWithLabel label="Data Domain Name">
                            {(db.Parameters && "data_owner_name" in db.Parameters) ? db.Parameters.data_owner_name : "n/a"}
                        </ValueWithLabel>
                        <ValueWithLabel label="Data Domain Account ID">
                            {(db.Parameters && "data_owner" in db.Parameters) ? db.Parameters.data_owner : "n/a"}   
                        </ValueWithLabel>
                        <ValueWithLabel label="Tags">
                            <ResourceLFTagsComponent resourceType="database" resourceName={dbName} />
                        </ValueWithLabel>
                    </SpaceBetween>
                </ColumnLayout>
            </Container>
        );
    } else {
        return null;
    }
}

export default DatabaseDetailsComponent;