BassNote
========

Visual help for Bass guitar notes

Made with <3 from Montréal

###Songs format :
- Notes : ```g10``` Cord "G", 10th fret.
- Silence : ```-``` will create an empty space. Can be more than one : ```---``` is 3 spaces.
- Mesure : ```|``` will create a line in all the strings. 
- Carriage return : ```~``` will return to a new line. 
- Carriage return with comments : ```~2x``` will return to a new line with a comment at the end.
- Hammer : ```a10h12``` will write an hammer note : ```10h12``` on the "A" string.

eg. : 
```["a7", "d6", "d7", "--", "d7", "|", "a10h12", "~2x"]```
will create : 
```
G|-----------|-------| 2x
D|---6-7---7-|-------|
A|-7---------|-10h12-|
E|-----------|-------|
```
