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
  
        return this.templates;
    }

    // Method to initialize the contract with a template
    async initialize(ctx) {
        this.templates = await this.loadTemplate(ctx);
        console.log('Contract has been initialized with the template');
        return `Initialized ${this.templates}`;
    }

    // Method to trigger a clause in the contract
    async trigger(ctx, requestData) {
        const template = this.templates['default'];
        if (!template) {
            throw new Error('Template not loaded');
        }

        const clause = new Clause(template);
        clause.parse(requestData);

        const engine = new Engine();
        const result = await engine.trigger(clause, { content: requestData }, null);

        console.log(`Trigger result: ${JSON.stringify(result)}`);
        return JSON.stringify(result.response);
    }
}

module.exports = CiceroContract;