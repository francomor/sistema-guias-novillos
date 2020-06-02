import re
import sqlite3

file1 = open('filas_compradores.txt', 'r')
Lines = file1.readlines()
f = open('salida.txt', 'w', encoding='ANSI')


conn = sqlite3.connect('database.sqlite')

count = 0
# Strips the newline character
for line in Lines:
  line = line.rstrip("\n")
  line = line.replace("\t", " ")
  release = re.compile(r"(?<=[\d.])\s+").split(line)
  print(line)
  # print(release)

  if len(release) == 8:
    respa = release[0]
    boleto_marca = release[1]
    boleto_senial = release[2]
    ingresos_brutos = release[3]
    establecimiento = release[4][:-3]
    cuit = release[4][-3:] + release[5]
    partida = release[6]
    repagro = release[7]
    boleto_marca = boleto_marca.replace(".", "")
    boleto_senial = boleto_senial.replace(".", "")
    partida = partida.replace(".", "")
    ingresos_brutos = re.sub(r'^[.]+', '', ingresos_brutos)
    cuit = cuit.strip()

    if not partida:
      partida = 'NULL'

    print(respa)
    print(boleto_marca)
    print(boleto_senial)
    print(ingresos_brutos)
    print(establecimiento)
    print(cuit)
    print(partida)
    print(repagro)

    cur = conn.cursor()
    cur.execute("SELECT idEstablecimiento FROM Establecimiento WHERE Nombre LIKE '" + establecimiento + "' and "
                "Partida = " + partida + " and Repagro = " + repagro + ";")
    rows = cur.fetchall()
    if rows:
      establecimiento = str(rows[0][0])
    if not establecimiento:
      establecimiento = 'NULL'

    salida = "INSERT INTO Productor (RENSPA, BoletoMarca, BoletoSenial, IngresosBrutos, idEstablecimiento, CUITPersona) VALUES ('"
    salida += respa + "', '"
    salida += boleto_marca + "', '"
    salida += boleto_senial + "', '"
    salida += ingresos_brutos + "', "
    salida += establecimiento + ", "
    salida += cuit + ");\n"
    print(salida)
    f.write(salida)
  #
  # elif len(release) == 4:
  #   respa = release[0]
  #   establecimiento = release[1][:-3]
  #   cuit = release[1][-3:] + release[2]
  #   cuit = cuit.replace("-", "")
  #   localidad = release[3]
  #
  #   # if 'El 25_Los Galpones' in establecimiento:
  #   #   establecimiento = 'El 25 Los Galpones'
  #   # if '13_de Abril' in establecimiento:
  #   #   establecimiento = '13 de Abril'
  #
  #   cur = conn.cursor()
  #   cur.execute("SELECT idEstablecimiento FROM Establecimiento WHERE Nombre LIKE '" + establecimiento + "';")
  #   rows = cur.fetchall()
  #   if rows:
  #     establecimiento = str(rows[0][0])
  #   if not establecimiento:
  #     establecimiento = 'NULL'
  #
  #
  #   cur.execute("SELECT idLocalidad FROM Localidad WHERE Nombre LIKE '" + localidad + "';")
  #   rows = cur.fetchall()
  #   if rows:
  #     localidad = str(rows[0][0])
  #   if not localidad:
  #     localidad = 'NULL'
  #
  #   salida = "INSERT INTO Comprador (RENSPA, idEstablecimiento, CUITPersona, idLocalidad) VALUES ('"
  #   salida += respa + "', "
  #   salida += establecimiento + ", "
  #   salida += cuit + ", "
  #   salida += localidad + ");\n"
  #   print(salida)
  #   # f.write(salida)

  else:
    # print(release)
    f.write(line + '\n')

  # El 25_Los Galpones
  # 13_de Abril

f.close()
