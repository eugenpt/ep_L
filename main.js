

function getLinks(src){
	return [...src.matchAll(/\[\[([^\]\|]+)(\|[^\]]+)?\]\]/gi)].map((m)=>{
		return {'link': m[1], 'alias': m[2]}
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
			console.log('adding '+item_match[1]+' to '+now_prop)
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

function onBodyLoad(){
	console.log(D)

	G = {}
	D.forEach((item)=>{
		t = getPropStrAndContent(item.content);
		props = parseProps(t.propstr);
		var prop_links = (
			(props.is||[]).map((v) => { return { 'to': v, 'type': 'is' }})
			+ (props.related_to||[]).map((v) => { return { 'to': v, 'type': 'related_to' }})
		);
		G[item.name] = {
			'src': item,
			'links': getLinks(item.content).map((m)=>m.link),
			'propstr': t.propstr,
			'content': t.content,
		}
	})

	teststr='---\ntest: test value\ntestemptylist:\ntestlist:\n   - item1\n - item2\n---\nLALA\n---\nqq:qq_value\n---\nKSKSKS\n'
	s = getPropStrAndContent(teststr).propstr
	console.log(teststr);
	console.log(getPropStrAndContent(teststr));
	console.log(parseProps(getPropStrAndContent(teststr).propstr))
}