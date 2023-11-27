

function getLinks(src){
	return [...src.matchAll(/\[\[([^\]\|]+)(\|[^\]]+)?\]\]/gi)].map((m)=>{
		return {'to': m[1], 'alias': m[2], 'match': m}
	})
}

function getHashtags(src){
	return [...src.matchAll(/(#[\w/]+)/gi)].map((m)=>{
		return {'to': m[1], 'match': m, 'type': 'has_hashtag'}
	})
}

function getPropStrAndContent(src){
	var m = [...src.matchAll(/^---\n(.+?)---\n/gis)];
	if(m.length==0){
		return {
			propstr: '',
			content: src,
		}
	}
	var content = src.slice();
	for(var t of m){
		content = content.replace(t[0],'')
	}

	return {
		propstr: m.length==1?m[0][1]:m.reduce((a,b)=>a[1]+b[1]),
		content: content,
	}
}

function parseProps(s){
	var lines = s.split('\n').filter((line)=> line.trim().length > 0);
	var props = {};
	var now_prop = null;
	const propdef_re = /\s*([^\s:]+)\s*:\s*(.*)/
	const listitem_re = /\s+\-\s+(.+)/
	for(line of lines){

		var match = propdef_re.exec(line)
		if(match == null){
			if(now_prop == null){
				console.warn('?? line='+line);
				continue
			}
			var item_match = listitem_re.exec(line);
			if(item_match == null){
				console.warn('?? line='+line);
				continue
			}
			// console.log('adding '+item_match[1]+' to '+now_prop)
			props[now_prop].push(item_match[1])
		} else {
			if(match[2].length==0){
				now_prop = match[1];
				if(now_prop in props){

				} else {
					props[now_prop] = [];
				}
			} else {
				now_prop = null;
				var value = match[2];
				if(value=='[]'){
					value = [];
				}
				props[match[1]] = value;
			}
		}
	}
	return props;
}

window.addEventListener("popstate", (event) => {
  console.log(
    `location: ${document.location}, state: ${JSON.stringify(event.state)}`,
  );
  if((event.state) && (event.state.key)){
  	showItem(decodeURIComponent(event.state.key));
  }
});

G = {};

function processRawHashtag(h, note_name){
	var path = h.split('/');
	var last_name = null;
	for(var j=0 ; j<path.length ; j++){
		var name = path.slice(0,j+1).join('/');
		if(!G[name]){
			G[name] = emptyG(name);
			if(last_name){
				G[name].links.push({
					'to': last_name, 'from': name, 'type': 'is',
				});
			}
		}
		last_name = name;
	}
}

function onBodyLoad(){
	console.log(D)

	G = {}
	D.forEach((item)=>{
		t = getPropStrAndContent(item.content);
		props = parseProps(t.propstr);
		var prop_links = (
			(props.is||[]).map((v) => { return { 'to': v, 'type': 'is' }})
			.concat((props.related_to||[]).map((v) => { return { 'to': v, 'type': 'related_to' }}))
		);
		content_links = getLinks(t.content);

		hashtag_links = getHashtags(t.content);
		for(var h of hashtag_links){
			processRawHashtag(h.to, item)
		}

		G[item.name] = {
			'name': name,
			'src': item,
			'linked': content_links.map((m)=>m.to).concat(prop_links.map((m)=>m.to)),
			'propstr': t.propstr,
			'content': t.content,
			'links':  content_links.concat(prop_links).concat(hashtag_links),
			'location': item.root,
			'backlinks': [],
		}
	})

	for(var name in G){
		for(var link of G[name].links){
			link.from = name;
			if(G[link.to])
				G[link.to]['backlinks'].push(link);
		}
	}

	teststr='---\ntest: test value\ntestemptylist:\ntestlist:\n   - item1\n - item2\n---\nLALA\n---\nqq:qq_value\n---\nKSKSKS\n'
	s = getPropStrAndContent(teststr).propstr
	console.log(teststr);
	console.log(getPropStrAndContent(teststr));
	console.log(parseProps(getPropStrAndContent(teststr).propstr))

  var url_key = getURLparam('key');
  if(url_key && G[url_key]){
  	showItem(url_key);
  }
}

function emptyG(name, linkedFrom){
	return {
			'name': name,
			'src': '',
			'linked': [],
			'propstr': '',
			'content': '',
			'links':  [],
			'location': G[linkedFrom]?G[linkedFrom].root : '',
			'backlinks': [ {'to':name, 'from':linkedFrom, 'type': 'related_to'} ],
	}
}

function showItem(name, linkedFrom){
	if (!(name in G)){
		G[name] = emptyG(
			name, linkedFrom
		);
	}
	_('#title').value = name;
	_('#ta').innerHTML = '<p>'+G[name].content.replace(/\[\[([^\]\|]+)\|([^\]]+)\]\]/gi,'<a class="local-a" title="$1" data-key="$1">$2</a>')
									.replace(/\[\[([^\]\|]+)\]\]/gi,'<a class="local-a" title="$1" data-key="$1">$1</a>').replaceAll('\n','</p><p>')+'</p>';

	_('#rightcol').innerHTML	= G[name].backlinks.map(link=>'<a class="local-a" title="'+link.from+'" data-key="'+link.from+'">'+link.from+'</a>').join('<br/><br/>');

	[... document.getElementsByClassName('local-a')].forEach((elt)=>{
		elt.onclick = function(){
			var key = this.dataset['key'];
			showItem(key, name);
			history.pushState({ key: key }, key, "?key=" + encodeURIComponent(key));
		};
	})				
}

function onSearchResultClick(elt){
	console.log(elt);
	showItem(elt.innerHTML)
}


function onSearchInput(){
	var q = _('#search').value;

	_("#searchResults").innerHTML = '';

	_("#searchResults").innerHTML = Object.keys(G)
										   .filter((key) => key.toLowerCase().indexOf(q.toLowerCase())>=0)
										   .map((key)=>{
	   	return '<div onclick="onSearchResultClick(this);">'+key+'</div><br/>'
	}).join('');
}


//