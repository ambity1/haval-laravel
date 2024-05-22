mysql-on:
	docker run --name myhaval -e MYSQL_DATABASE=haval -e MYSQL_PASSWORD=password -e MYSQL_USER=green -e MYSQL_ROOT_PASSWORD=password -p "3306":"3306"  mysql/mysql-server:8.0
mysql-start:
	docker start myhaval
serve:
	php artisan serve
