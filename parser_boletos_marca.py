import re
import sqlite3
import unidecode

file1 = open('boletos-marca.txt', 'r', encoding='UTF-8')
Lines = file1.readlines()
f = open('salida.txt', 'w', encoding='UTF-8')
f_malos = open('salida_no_match.txt', 'w', encoding='UTF-8')


conn = sqlite3.connect('database.sqlite')

for line in Lines:
  line = line.rstrip("\n")
  release = line.split(',')
  print(line)
  # print(release)

  nombre_productor = unidecode.unidecode(release[0].rstrip(".").rstrip())
  boleto_marca = release[1]
  inc = release[2]
  folio = release[3]
  vence = release[4]

  dia, mes, ano = vence.split("-")

  print(nombre_productor)
  print(boleto_marca)
  print(inc)
  print(folio)
  print(vence)
  print(dia)
  print(mes)
  print("20"+ano)

  cur = conn.cursor()
  cur.execute("SELECT idProductor, RazonSocial "
              "FROM Productor "
              "JOIN Persona on Productor.CUITPersona = Persona.CUIT "
              "where Persona.RazonSocial='" + nombre_productor + "';")
  rows = cur.fetchall()
  if rows:
    if len(rows) > 1:
      f_malos.write(line + "\n")
    else:
      print(rows)
      id_productor = str([i[0] for i in rows][0])
      salida = "UPDATE Productor " \
               "SET BoletoMarca = '" + boleto_marca + "', " \
               "BoletoMarcaFolio = '" + folio + "', " \
               "VencimientoBoletoMarca = '" + dia + '-' + mes + '-' + '20' + ano + "', " \
               "BoletoMarcaInc = '" + inc + "' " \
               "WHERE idProductor = " + id_productor + ";\n"
      print(salida)
      f.write(salida)
  else:
    f_malos.write(line + "\n")
    print('no match')


f.close()
f_malos.close()
