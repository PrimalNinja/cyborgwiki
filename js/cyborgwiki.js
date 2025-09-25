// CyborgWiki v20250708
// (c) 2025 Cyborg Unicorn Pty Ltd.
// This software is released under MIT License.

function cyborgWikiToHtml(strWiki_a, strInternalPageURL_a, strInternalImageURL_a, arrPlaceholders_a) 
{
	var intI;
	
	// Extract code blocks first to protect them from processing
	var arrCodeBlocks = [];
	var intCodeCounter = 0;
	var strResult = strWiki_a.replace(/<code>([\s\S]*?)<\/code>/gi, function(strMatch_a, strCode_a) 
	{
		var strPlaceholder = '~CODE_' + intCodeCounter + '~';
		arrCodeBlocks.push(strCode_a);
		intCodeCounter++;
		return strPlaceholder;
	});

	// Replace placeholders
	if (arrPlaceholders_a) 
	{
		for (intI = 0; intI < arrPlaceholders_a.length; intI++) 
		{
			var objPlaceholder = arrPlaceholders_a[intI];

			// Use a case-insensitive global match for placeholder text
			var regex = new RegExp(objPlaceholder.placeholder.toUpperCase(), 'g');
			strResult = strResult.replace(regex, objPlaceholder.value);
		}
	}

	strResult = strResult.replace(/\r/g, '');

	// Headings (match from largest to smallest to prevent partial replaces)
	// Note the order: === first, then ==, then =
	strResult = strResult.replace(/====(.*?)====/g, '<span class="gscw-subsubheading">$1</span>');
	strResult = strResult.replace(/===(.*?)===/g, '<span class="gscw-subsubheading">$1</span>');
	strResult = strResult.replace(/==(.*?)==/g, '<span class="gscw-subheading">$1</span>');
	strResult = strResult.replace(/=(.*?)=/g, '<span class="gscw-heading">$1</span>');

	// Bold text
	strResult = strResult.replace(/'''(.*?)'''/g, '<span class="gscw-bold">$1</span>');
	
	// Horizontal Rule
	strResult = strResult.replace(/- - - -/g, '<hr class="gscw-hr">');

	// Internal Images
	strResult = strResult.replace(/\[\[Image:(.*?)\|(.*?)\]\]/g, '<img class="gscw-image" src="' + strInternalImageURL_a + '$1" alt="$2"/>');

	// External Images
	strResult = strResult.replace(/\[Image:(.*?)\|(.*?)\]/g, '<img class="gscw-image" src="$1" alt="$2"/>');

	// Internal Links
	//strResult = strResult.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<span class="gscw-internallink gecw-internallink" wiki="$1" title="$2">$2</span>');
	strResult = strResult.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a class="gscw-internallink gecw-internallink" href="' + strInternalPageURL_a + '$1&title=$2">$2</a>');

	// External Links
	strResult = strResult.replace(/\[(http[s]?:\/\/(.*?))\|(.*?)\]/g, '<a class="gscw-link" href="$1" target="_blank">$3</a>');

	strResult = strResult.replace(/\{\|\s*/g, '<table class="gscw-table"><tr>');
	strResult = strResult.replace(/\|-\s*/g, '</tr><tr>');
	strResult = strResult.replace(/\!\!/g, '</th><th>');
	strResult = strResult.replace(/\! /g, '<th>');
	strResult = strResult.replace(/\|\}\s*/g, '</tr></table>');
	strResult = strResult.replace(/\|\|/g, '</td><td>');
	strResult = strResult.replace(/\| /g, '<td>');

	// Handle lists by parsing line by line
	var arrLines = strResult.split('\n');
	var arrNewLines = [];
	var strListHtml = '';
	var strListType = null;

	for (intI = 0; intI < arrLines.length; intI++) 
	{
		var strLine = arrLines[intI];

		// Check for unordered list item
		if (strLine.match(/^\*/)) 
		{
			if (strListType !== 'ul') 
			{
				// Close previous list block if needed
				if (strListType) 
				{
					arrNewLines.push(strListHtml + (strListType === 'ol' ? '</ol>' : '</ul>'));
				}

				// Start a new UL
				strListHtml = '<ul class="gscw-list">';
				strListType = 'ul';
			}

			// Append list item
			strListHtml += '<li>' + strLine.replace(/^\*/, '').trim() + '</li>';
		}
		// Check for ordered list item
		else if (strLine.match(/^#/)) 
		{
			if (strListType !== 'ol') 
			{
				// Close previous list block if there is one
				if (strListType) 
				{
					arrNewLines.push(strListHtml + (strListType === 'ol' ? '</ol>' : '</ul>'));
				}

				// Start a new OL
				strListHtml = '<ol class="gscw-list">';
				strListType = 'ol';
			}
			
			// Append list item
			strListHtml += '<li>' + strLine.replace(/^#/, '').trim() + '</li>';
		}
		// Not a list line
		else 
		{
			// If we were in a list, close it
			if (strListType) 
			{
				arrNewLines.push(strListHtml + (strListType === 'ol' ? '</ol>' : '</ul>'));
				strListType = null;
				strListHtml = '';
			}

			// Push the current line as normal content
			if (strLine.match(/<(h[1-3]|span|a|img).*?>/)) 
			{
				arrNewLines.push(strLine);
			} 
			else 
			{
				arrNewLines.push(strLine);
			}
		}
	}

	// If still in a list, close out the list
	if (strListType) 
	{
		arrNewLines.push(strListHtml + (strListType === 'ol' ? '</ol>' : '</ul>'));
	}

	// Rejoin processed lines
	strResult = arrNewLines.join('<br>');

	// Restore code blocks (this replaces the old inline code block handling)
// Restore code blocks (this replaces the old inline code block handling)
	for (intI = 0; intI < arrCodeBlocks.length; intI++) 
	{
		// HTML escape the code content
		var strEscapedCode = arrCodeBlocks[intI]
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		
		strResult = strResult.replace('~CODE_' + intI + '~', '<pre class="gscw-code">' + strEscapedCode + '</pre>');
	}

	return strResult;
}