import sqlite3
import os

d = os.getcwd()


# if we error, we rollback automatically, else commit!
names = ['one','two','three','four','five','six','seven','eight','nine']
for n in names: 
    with sqlite3.connect(d+'/'+n+'.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT SQLITE_VERSION()')
        data = cursor.fetchone()
        # print('SQLite version:', data)
        print(f"    '{n}': {{")
        print(f"        'ENGINE': 'django.db.backends.sqlite3',  # Use SQLite instead of PostgreSQL")
        print(f"        'NAME': BASE_DIR / 'db.sqlite3',  # Use the default SQLite database file")
        print('    },')

print('\n\n1. Move them home location')
print('2. Add to settings.py')