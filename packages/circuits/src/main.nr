use binary_merkle_root::binary_merkle_root;
use poseidon;

fn main(
    //public inputs
    null_hash: pub Field,
    root: pub Field,
    vote: pub bool,
    depth: pub u32,
    //private inputs
    nullifier: Field,
    secret: Field,
    index: Field,
    siblings: [Field; 16],
) {
    let computed_nullifier_hash: Field = poseidon::poseidon::bn254::hash_1([nullifier]);
    //check that the nullifier matches the public input
    assert(computed_nullifier_hash == null_hash);

    let mut siblings_num = 0;

    for i in 0..siblings.len() {
        if (siblings[i] != 0) {
            siblings_num += 1;
        }
    }
    //check that provided merkle tree depth is correct
    assert(depth <= siblings.len());

    let index_bits: [u1; 16] = index.to_le_bits();
    let commitment: Field = poseidon::poseidon::bn254::hash_2([nullifier, secret]);
    let computed_root = binary_merkle_root(
        poseidon::poseidon::bn254::hash_2,
        commitment,
        siblings_num,
        index_bits,
        siblings,
    );

    assert(computed_root == root);
    //cast vote to Field
    let vote_field = vote as Field;
    assert((vote_field * vote_field) == vote_field);
}
