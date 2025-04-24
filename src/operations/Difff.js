/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.js";
import Utils from "../Utils.js";
import {
    diffJson,
    diffCss,
    diffChars,
    diffWords,
    diffWordsWithSpace,
    diffTrimmedLines,
    diffLines,
    diffSentences,
} from "diff";
import OperationError from "../errors/OperationError.js";

/**
 * Diff operation
 */
class Diff extends Operation {
    /**
     * Diff constructor
     */
    constructor() {
        super();

        this.name = "Diff";
        this.module = "Diff";
        this.description =
            "Compares two inputs (separated by the specified delimiter) and highlights the differences between them.";
        this.infoURL = "https://wikipedia.org/wiki/File_comparison";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: "\\n\\n",
            },
            {
                name: "Diff by",
                type: "option",
                value: ["Character", "Word", "Line", "Sentence", "CSS", "JSON"],
            },
            {
                name: "Show added",
                type: "boolean",
                value: true,
            },
            {
                name: "Show removed",
                type: "boolean",
                value: true,
            },
            {
                name: "Show subtraction",
                type: "boolean",
                value: false,
            },
            {
                name: "Ignore whitespace",
                type: "boolean",
                value: false,
                hint: "Relevant for word and line",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [
                sampleDelim,
                diffBy,
                showAdded,
                showRemoved,
                showSubtraction,
                ignoreWhitespace,
            ] = args,
            samples = input.split(sampleDelim);
        let output = "",
            diff;

        if (!samples || samples.length !== 2) {
            throw new OperationError(
                "Incorrect number of samples, perhaps you need to modify the sample delimiter or add more samples?"
            );
        }

        switch (diffBy) {
            case "Character":
                diff = diffChars(samples[0], samples[1]);
                break;
            case "Word":
                if (ignoreWhitespace) {
                    diff = diffWords(samples[0], samples[1]);
                } else {
                    diff = diffWordsWithSpace(samples[0], samples[1]);
                }
                break;
            case "Line":
                if (ignoreWhitespace) {
                    diff = diffTrimmedLines(samples[0], samples[1]);
                } else {
                    diff = diffLines(samples[0], samples[1]);
                }
                break;
            case "Sentence":
                diff = diffSentences(samples[0], samples[1]);
                break;
            case "CSS":
                diff = diffCss(samples[0], samples[1]);
                break;
            case "JSON":
                diff = diffJson(samples[0], samples[1]);
                break;
            default:
                throw new OperationError("Invalid 'Diff by' option.");
        }

        for (let i = 0; i < diff.length; i++) {
            if (diff[i].added) {
                if (showAdded)
                    output +=
                        "<ins>" + Utils.escapeHtml(diff[i].value) + "</ins>";
            } else if (diff[i].removed) {
                if (showRemoved)
                    output +=
                        "<del>" + Utils.escapeHtml(diff[i].value) + "</del>";
            } else if (!showSubtraction) {
                output += Utils.escapeHtml(diff[i].value);
            }
        }

        return output;
    }
}

export default Diff;
