/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { Clause, Template } = require('@accordproject/cicero-core');
const { Engine } = require('@accordproject/cicero-engine');
const { CiceroMarkTransformer } = require('@accordproject/markdown-cicero');
const bent = require('bent');
const getJSON = bent('json');
const fs = require('fs');
const path = require('path');

class CiceroContract extends Contract {
    constructor() {
        super(); // Calls the constructor of the parent class 'Contract'
        this.templates = {}; // Initializes a templates object to store Cicero templates
    }

    // Asynchronous method to load a template
    async loadTemplate(ctx) {
        const templatePath = path.join(__dirname, 'susanna.cta');

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        const templateBuffer = fs.readFileSync(templatePath);
        const template = await Template.fromArchive(templateBuffer);

        this.templates['default'] = template;
        console.log(`Loaded template: ${template.getIdentifier()}`);
  
        return template;
    }

    async handleWaterSupplyRequest(ctx, requestDetails) {
        // Load the template as before
        const template = await this.loadTemplate(ctx);
    
        // Create an instance of the Cicero Engine
        const engine = new Engine();
    
        const markdown = fs.readFileSync(
            path.resolve(__dirname,"sample.md"),
            "utf8"
          );

        // Create a request transaction object
        const request = { $class: "org.example.water.WaterSupplyRequest", input: "test" };
    
            // Create an instance of Clause with the template
        const clause = new Clause(template);
        // // Ensure requestDetails is the actual contract text that matches the template structure
        clause.parse(markdown);

        // Now you can safely call getData
        const clauseData = clause.getData();
        const state = {
            $class: "org.accordproject.runtime.State",
          };

        // Execute the contract logic
        const result = await engine.trigger(clause, request, state, null);
    
        // Handle the response and update the blockchain state as necessary
        const response = result.response;
        console.log(`Response: ${response.status}`);
    
        // Return or process the response as needed
        return response;
    }

}

module.exports = CiceroContract;
