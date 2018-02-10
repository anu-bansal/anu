var fs = require('fs');
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var wordcount = require('word-count');
var WordPOS = require('wordpos');
wordpos = new WordPOS();
var stringSimilarity = require('string-similarity');
var noun_covered = 0;
var adjectives_covered = 0;
var verbs_covered = 0;
var adverbs_covered = 0;
var is_word_limit_ok;
var mydocument_token_array = new Array(4);
var standard_token_array = new Array(4);
var similarity = 0;
var mistakes = 0;
var incorrectWords = [];
var extra_marks_given = 0;
var concept_covered = [];
var remark_to_reject_due_to_count = 'null';


//reading files required
var my_document = fs.readFileSync('document.txt', 'utf-8');
var standard_document = fs.readFileSync('document2.txt', 'utf-8');
var keyWords = fs.readFileSync('keyWords.txt', 'utf-8');
var dictionary = fs.readFileSync('dictionary.txt', 'utf-8');


//counting words of user document and standard document
var countwords_my = wordcount(my_document);
var countwords_standard = wordcount(standard_document);

//function to check word limit
function check_word_limit() {
	var range1 = countwords_standard - countwords_standard * 0.1;
	var range2 = countwords_standard + countwords_standard * 0.1;
	if (countwords_my < range1 || countwords_my > range2) {
		is_word_limit_ok = "No";
		if (countwords_my < range1) {
			remark_to_reject_due_to_count = "Words are less than expected.";
		} else {
			remark_to_reject_due_to_count = "Words are more than expected.";
		}
		return;
	} else {
		is_word_limit_ok = "yes";
	}
}

//function to divide document into noun, adjectieves, verb, adverb
function document_token(document, arr) {
	//counting nouns
	wordpos.getNouns(document, function (result) {
		arr[0] = result.length;
	});

	wordpos.getAdjectives(document, function (result) {
		arr[1] = result.length;
	});

	wordpos.getVerbs(document, function (result) {
		arr[2] = result.length;
	});

	wordpos.getAdverbs(document, function (result) {
		arr[3] = result.length;
	});
}

//function to print noun, adjectieves, verb, adverb of user document
function print_mydocument_token() {
	for (var i = 0; i < 4; i++) {
		//	console.log("Reading your file");
		console.log(mydocument_token_array[i]);
	}
}

//function to print noun, adjectieves, verb, adverb of standard document
function print_standard_token() {
	for (var i = 0; i < 4; i++) {
		//	console.log("Reading standard file");

		console.log(standard_token_array[i]);
	}
}

//function to calculate % difference in noun, adjectieves, verb, adverb of user document and standard document
function calculate_token_variation() {
	noun_covered = ((standard_token_array[0] - mydocument_token_array[0]) / standard_token_array[0]) * 100;
	adjectives_covered = ((standard_token_array[1] - mydocument_token_array[1]) / standard_token_array[1]) * 100;
	verbs_covered = ((standard_token_array[2] - mydocument_token_array[2]) / standard_token_array[2]) * 100;
	adverbs_covered = ((standard_token_array[3] - mydocument_token_array[3]) / standard_token_array[3]) * 100;
	console.log(noun_covered + " " + adjectives_covered + " " + verbs_covered + " " + adverbs_covered);

}

//function to calculate similarity between user document and standard document
function calculate_similarity() {
	similarity = (stringSimilarity.compareTwoStrings(my_document, standard_document)) * 100;
	console.log(similarity);
}


//function to check spelling from dictionary
function checking_spelling() {
	var token_dictionary = tokenizer.tokenize(dictionary);
	var token_mydocument = tokenizer.tokenize(standard_document);
	var spellcheck = new natural.Spellcheck(token_dictionary);

	for (i in token_mydocument) {
		if (!spellcheck.isCorrect(token_mydocument[i].toLowerCase())) {
			mistakes++;
			incorrectWords.push(token_mydocument[i]);
		}
	}
	console.log("These are the spelling mistakes you had : \n" + incorrectWords + "and you have these many mistakes \n: " + mistakes);
}

//fuction to check some keywords are present or not
function checking_keywords() {

	var token_mydocument = tokenizer.tokenize(standard_document);
	var token_keywords = tokenizer.tokenize(keyWords);
	var spellcheck = new natural.Spellcheck(token_mydocument);

	for (i in token_keywords) {
		if (spellcheck.isCorrect(token_keywords[i].toLowerCase())) {
			extra_marks_given++;
			concept_covered.push(token_keywords[i]);
		}
	}
	console.log("These are the concepts that you have covered :" + concept_covered);
	console.log("\nExtra marks for that :" + extra_marks_given);
}


console.log(countwords_my);
console.log(countwords_standard);
check_word_limit();
console.log(is_word_limit_ok);
console.log(remark_to_reject_due_to_count);
calculate_similarity();
checking_spelling();
checking_keywords();

let output = {
	myjsonobj:{
	no_of_words: {
		standard: countwords_standard,
		user_doc: countwords_my
	},

	word_limit_ok: is_word_limit_ok,
	remark_to_reject: remark_to_reject_due_to_count,
	similarity_btw_document: similarity,
	spelling: {
		no_of_mistakes: mistakes,
		incorrect_words: incorrectWords
	},
	coreconcept: {
		no_extra_marks: extra_marks_given,
		concept_covered: concept_covered
	}
}
};

let json = JSON.stringify(output, null, 2);
fs.writeFile('myjsondata.json', json, 'utf8', (err) => {
	if (err) {
		console.log("error");
		return;
	}
	console.log("success");
})
