#!/bin/bash

mysql -u$1 -p$2 -e 'source schema.sql';
mysql -u$1 -p$2 -e 'source bootstrap.sql';

echo 'Database created';