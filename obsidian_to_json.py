import os
import json

# %%

def load_obsidian_item(fpath):
	return open(fpath, 'r', encoding='utf-8').read()

def load_obsidian(rpath, current_root=[]):
	R = []
	for item in os.listdir(rpath):
		path = os.path.join(rpath, item)
		if os.path.isfile(path) and item[-3:]=='.md':
			R.append({
				'name': item[:-3],
				'content': load_obsidian_item(path),
				'root': current_root
			})
		elif os.path.isdir(path):
			R = R +  load_obsidian(
				os.path.join(rpath, item), 
				current_root+[item]
			)
			
	return R

# %%


def add_sfx(fname, sfx):
	if type(sfx) is int:
		sfx = '_%i' % sfx
	[fname, ext] = os.path.splitext(fname)
	return fname + sfx + ext

def rename(oldname):
	j=1
	newname=add_sfx(oldname, j)
	while os.path.isfile(newname):
		j = j + 1
		newname=add_sfx(oldname, j)
	os.rename(oldname, newname)
		

# %%

def main():
	rpath = input('Enter root path for Obsidian vault:\n')

	if not os.path.isdir(rpath):
		print('Not a dir.')
		return
	
	outpath = input('Enter output filename [noGit/D.js]: ')
	if outpath == '':
		outpath = 'noGit/D.js'

	if not os.path.isdir(os.path.dirname(outpath)):
		os.mkdir(os.path.dirname(outpath))

	if os.path.isfile(outpath):
		rename(outpath)

	data = load_obsidian(rpath)

	output = 'D = '+json.dumps(data, ensure_ascii=False)+';\n'

	print(output)

	with open(outpath, 'w', encoding='utf-8') as f:
		f.write(output)	





# %%

if __name__ == "__main__":
	main()