def main():
    a = 20
    def f():
        print(f"inside f: a = {a}")
        a += 1

    f()
    print(f"a = {a}")

main()