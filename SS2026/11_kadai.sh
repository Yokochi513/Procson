#!/bin/sh
mkdir ~/SSwork/math_csv
mkdir ~/SSwork/prog_csv
cp ~/datafiles/math* ~/SSwork/math_csv/
cp ~/datafiles/prog* ~/SSwork/prog_csv/


# $1 に科目名が入る
mkdir ~/SSwork/${1}_csv
cp ~/datafiles/${1}* ~/SSwork/${1}_csv/

#zikkou
sh add_subject.sh id1

#dami-file
touch ~/datafiles/id1_01.csv
touch ~/datafiles/id1_02.csv

#zikkou
sh add_subject.sh id1

#kakuninn
ls ~/SSwork/id1_csv