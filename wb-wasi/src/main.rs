fn main() -> anyhow::Result<()> {
    let a: Vec<String> = std::env::args().collect();
    let mut b = wasm_bindgen_cli_support::Bindgen::new();
    b.input_path(&a[1]).web(true)?.typescript(true).omit_default_module_path(false).generate(&a[2])?;
    println!("OK");
    Ok(())
}
